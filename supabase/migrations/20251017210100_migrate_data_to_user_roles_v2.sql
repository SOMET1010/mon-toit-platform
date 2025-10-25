-- ============================================
-- Migration: Données user_active_roles → user_roles V2
-- Date: 2025-10-17
-- Description: Migrer les données existantes vers la nouvelle structure
-- ============================================

-- 1. Migrer les données de user_active_roles vers user_roles
INSERT INTO user_roles (user_id, roles, active_role, created_at, updated_at)
SELECT 
  uar.user_id,
  -- Construire le JSONB des rôles disponibles
  (
    SELECT jsonb_object_agg(
      role_name,
      jsonb_build_object(
        'enabled', true,
        'verified', true,
        'added_at', uar.created_at
      )
    )
    FROM unnest(uar.available_roles) AS role_name
  ) as roles,
  uar.current_role as active_role,
  uar.created_at,
  uar.updated_at
FROM user_active_roles uar
ON CONFLICT (user_id) DO UPDATE
SET 
  roles = EXCLUDED.roles,
  active_role = EXCLUDED.active_role,
  updated_at = NOW();

-- 2. Pour les utilisateurs qui n'ont pas d'entrée dans user_active_roles,
--    créer une entrée par défaut basée sur profiles.user_type
INSERT INTO user_roles (user_id, roles, active_role)
SELECT 
  p.id as user_id,
  jsonb_build_object(
    COALESCE(p.user_type, 'locataire'),
    jsonb_build_object(
      'enabled', true,
      'verified', false,
      'added_at', NOW()
    )
  ) as roles,
  COALESCE(p.user_type, 'locataire') as active_role
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles ur WHERE ur.user_id = p.id
)
AND p.user_type IS NOT NULL;

-- 3. Afficher un résumé de la migration
DO $$
DECLARE
  v_migrated_count INTEGER;
  v_new_count INTEGER;
  v_total_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_migrated_count
  FROM user_roles ur
  INNER JOIN user_active_roles uar ON ur.user_id = uar.user_id;

  SELECT COUNT(*) INTO v_new_count
  FROM user_roles ur
  WHERE NOT EXISTS (
    SELECT 1 FROM user_active_roles uar WHERE uar.user_id = ur.user_id
  );

  SELECT COUNT(*) INTO v_total_count FROM user_roles;

  RAISE NOTICE '✅ Migration terminée:';
  RAISE NOTICE '   - Migrés depuis user_active_roles: %', v_migrated_count;
  RAISE NOTICE '   - Créés depuis profiles: %', v_new_count;
  RAISE NOTICE '   - Total: %', v_total_count;
END $$;

