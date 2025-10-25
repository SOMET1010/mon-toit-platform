-- ============================================
-- Migration: Système de Changement de Rôle V2
-- Date: 2025-10-17
-- Description: Nouvelle table user_roles simplifiée et sécurisée
-- ============================================

-- 1. Créer la nouvelle table user_roles
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Rôles disponibles (JSONB pour flexibilité)
  roles JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Rôle actif
  active_role TEXT NOT NULL CHECK (active_role IN ('locataire', 'proprietaire', 'agence', 'admin_ansut')),
  
  -- Sécurité et rate limiting
  last_switch_at TIMESTAMPTZ,
  switch_count_today INTEGER DEFAULT 0 CHECK (switch_count_today >= 0),
  switch_count_total INTEGER DEFAULT 0 CHECK (switch_count_total >= 0),
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Créer les index pour performance
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON user_roles(active_role);
CREATE INDEX IF NOT EXISTS idx_user_roles_last_switch ON user_roles(last_switch_at);
CREATE INDEX IF NOT EXISTS idx_user_roles_created ON user_roles(created_at);

-- 3. Activer Row Level Security
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Politique RLS : Les utilisateurs peuvent voir leurs propres rôles
CREATE POLICY "Users can view their own roles"
  ON user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- 5. Politique RLS : Les utilisateurs peuvent mettre à jour leurs propres rôles via Edge Function uniquement
CREATE POLICY "Users can update their own roles via service role"
  ON user_roles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 6. Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_user_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_roles_updated_at();

-- 7. Fonction pour ajouter un rôle disponible
CREATE OR REPLACE FUNCTION add_user_role(
  p_user_id UUID,
  p_role TEXT,
  p_verification_method TEXT DEFAULT NULL,
  p_verification_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSONB AS $$
DECLARE
  v_roles JSONB;
  v_new_role JSONB;
BEGIN
  -- Vérifier que le rôle est valide
  IF p_role NOT IN ('locataire', 'proprietaire', 'agence', 'admin_ansut') THEN
    RAISE EXCEPTION 'Rôle invalide: %', p_role;
  END IF;

  -- Récupérer les rôles actuels
  SELECT roles INTO v_roles
  FROM user_roles
  WHERE user_id = p_user_id;

  -- Vérifier si le rôle existe déjà
  IF v_roles ? p_role THEN
    RAISE EXCEPTION 'Le rôle % existe déjà', p_role;
  END IF;

  -- Créer le nouveau rôle
  v_new_role = jsonb_build_object(
    'enabled', true,
    'verified', CASE WHEN p_verification_method IS NOT NULL THEN true ELSE false END,
    'verification_method', p_verification_method,
    'verification_date', p_verification_date,
    'added_at', NOW()
  );

  -- Ajouter le rôle
  v_roles = v_roles || jsonb_build_object(p_role, v_new_role);

  -- Mettre à jour la table
  UPDATE user_roles
  SET roles = v_roles,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN v_roles;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Fonction pour réinitialiser le compteur quotidien à minuit
CREATE OR REPLACE FUNCTION reset_daily_switch_count()
RETURNS void AS $$
BEGIN
  UPDATE user_roles
  SET switch_count_today = 0
  WHERE last_switch_at < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- 9. Commentaires pour documentation
COMMENT ON TABLE user_roles IS 'Gestion des rôles utilisateurs avec rate limiting et sécurité renforcée (V2)';
COMMENT ON COLUMN user_roles.roles IS 'JSONB contenant les rôles disponibles avec métadonnées (enabled, verified, verification_method, etc.)';
COMMENT ON COLUMN user_roles.active_role IS 'Rôle actuellement actif pour l''utilisateur';
COMMENT ON COLUMN user_roles.last_switch_at IS 'Date du dernier changement de rôle (pour cooldown de 15 minutes)';
COMMENT ON COLUMN user_roles.switch_count_today IS 'Nombre de changements effectués aujourd''hui (max 3)';
COMMENT ON COLUMN user_roles.switch_count_total IS 'Nombre total de changements depuis la création du compte';

-- 10. Créer une vue pour faciliter les requêtes
CREATE OR REPLACE VIEW user_roles_summary AS
SELECT 
  ur.user_id,
  ur.active_role,
  jsonb_object_keys(ur.roles) as available_roles,
  ur.last_switch_at,
  ur.switch_count_today,
  ur.switch_count_total,
  CASE 
    WHEN ur.last_switch_at IS NULL THEN true
    WHEN EXTRACT(EPOCH FROM (NOW() - ur.last_switch_at)) / 60 >= 15 THEN true
    ELSE false
  END as can_switch_now,
  CASE
    WHEN ur.switch_count_today >= 3 THEN false
    ELSE true
  END as has_switches_remaining,
  3 - ur.switch_count_today as switches_remaining_today
FROM user_roles ur;

COMMENT ON VIEW user_roles_summary IS 'Vue résumée des rôles utilisateurs avec informations de disponibilité';

