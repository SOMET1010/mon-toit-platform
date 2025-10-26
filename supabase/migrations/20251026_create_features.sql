-- Création de la table features pour les fonctionnalités de la plateforme
-- Date: 2025-10-26
-- Auteur: Manus AI

CREATE TABLE IF NOT EXISTS public.features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icon TEXT NOT NULL, -- Nom de l'icône Lucide
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT CHECK (category IN ('core', 'certification', 'payment', 'security', 'other')),
  is_highlighted BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour l'affichage
CREATE INDEX IF NOT EXISTS idx_features_category ON public.features (category, display_order);
CREATE INDEX IF NOT EXISTS idx_features_highlighted ON public.features (is_highlighted, display_order);

-- Activer RLS
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;

-- Politique: Lecture publique
CREATE POLICY "Features are viewable by everyone"
  ON public.features FOR SELECT
  USING (true);

-- Politique: Seuls les admins peuvent modifier
CREATE POLICY "Only admins can modify features"
  ON public.features FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Commentaires
COMMENT ON TABLE public.features IS 'Fonctionnalités de la plateforme affichées sur la landing page';
COMMENT ON COLUMN public.features.icon IS 'Nom de l''icône Lucide React (ex: ShieldCheck, Home, etc.)';
COMMENT ON COLUMN public.features.category IS 'Catégorie de la fonctionnalité';
COMMENT ON COLUMN public.features.is_highlighted IS 'Mettre en avant sur la page d''accueil';

