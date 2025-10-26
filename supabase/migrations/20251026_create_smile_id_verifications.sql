-- Migration: Créer la table smile_id_verifications
-- Date: 2025-10-26
-- Description: Table pour stocker les résultats de vérification Smile ID

-- Créer la table smile_id_verifications
CREATE TABLE IF NOT EXISTS public.smile_id_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  -- Données Smile ID
  smile_job_id TEXT NOT NULL UNIQUE,
  confidence_score DECIMAL(3, 2) NOT NULL DEFAULT 0.0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  result_code TEXT NOT NULL,
  result_text TEXT NOT NULL,
  
  -- URLs des images
  selfie_image_url TEXT,
  id_image_url TEXT,
  
  -- Réponse complète de Smile ID (JSON)
  full_response JSONB,
  
  -- Métadonnées de révision
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  review_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_smile_id_verifications_user_id ON public.smile_id_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_smile_id_verifications_status ON public.smile_id_verifications(status);
CREATE INDEX IF NOT EXISTS idx_smile_id_verifications_created_at ON public.smile_id_verifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_smile_id_verifications_smile_job_id ON public.smile_id_verifications(smile_job_id);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_smile_id_verifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_smile_id_verifications_updated_at
  BEFORE UPDATE ON public.smile_id_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_smile_id_verifications_updated_at();

-- Ajouter la colonne smile_id_verified dans la table profiles si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'smile_id_verified'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN smile_id_verified BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- RLS (Row Level Security) Policies
ALTER TABLE public.smile_id_verifications ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs peuvent voir leurs propres vérifications
CREATE POLICY "Users can view their own verifications"
  ON public.smile_id_verifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent créer leurs propres vérifications
CREATE POLICY "Users can create their own verifications"
  ON public.smile_id_verifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Les admins peuvent tout voir
CREATE POLICY "Admins can view all verifications"
  ON public.smile_id_verifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type IN ('admin_ansut', 'agent_confiance')
    )
  );

-- Policy: Les admins peuvent tout modifier
CREATE POLICY "Admins can update all verifications"
  ON public.smile_id_verifications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type IN ('admin_ansut', 'agent_confiance')
    )
  );

-- Commentaires pour documentation
COMMENT ON TABLE public.smile_id_verifications IS 'Stocke les résultats de vérification d''identité Smile ID';
COMMENT ON COLUMN public.smile_id_verifications.smile_job_id IS 'ID unique du job Smile ID';
COMMENT ON COLUMN public.smile_id_verifications.confidence_score IS 'Score de confiance de 0 à 1 (0% à 100%)';
COMMENT ON COLUMN public.smile_id_verifications.result_code IS 'Code de résultat retourné par Smile ID';
COMMENT ON COLUMN public.smile_id_verifications.result_text IS 'Texte descriptif du résultat';
COMMENT ON COLUMN public.smile_id_verifications.full_response IS 'Réponse JSON complète de l''API Smile ID';
COMMENT ON COLUMN public.smile_id_verifications.status IS 'Statut de la vérification: pending, approved, rejected';

