-- Création de la table neighborhoods pour les quartiers d'Abidjan
-- Date: 2025-10-26
-- Auteur: Manus AI

CREATE TABLE IF NOT EXISTS public.neighborhoods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  bounds JSONB NOT NULL, -- {north, south, east, west}
  center JSONB NOT NULL, -- {latitude, longitude}
  price_range JSONB NOT NULL, -- {min, max, average}
  scores JSONB NOT NULL, -- {transport, commerce, education, security, healthcare}
  description TEXT NOT NULL,
  characteristics TEXT[] NOT NULL,
  population INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les recherches géographiques
CREATE INDEX IF NOT EXISTS idx_neighborhoods_center ON public.neighborhoods USING GIN (center);

-- Index pour les recherches par prix
CREATE INDEX IF NOT EXISTS idx_neighborhoods_price ON public.neighborhoods USING GIN (price_range);

-- Activer RLS (Row Level Security)
ALTER TABLE public.neighborhoods ENABLE ROW LEVEL SECURITY;

-- Politique: Lecture publique
CREATE POLICY "Neighborhoods are viewable by everyone"
  ON public.neighborhoods FOR SELECT
  USING (true);

-- Politique: Seuls les admins peuvent modifier
CREATE POLICY "Only admins can modify neighborhoods"
  ON public.neighborhoods FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Commentaires
COMMENT ON TABLE public.neighborhoods IS 'Quartiers d''Abidjan avec informations géographiques et statistiques';
COMMENT ON COLUMN public.neighborhoods.bounds IS 'Limites géographiques du quartier (nord, sud, est, ouest)';
COMMENT ON COLUMN public.neighborhoods.center IS 'Centre géographique du quartier (latitude, longitude)';
COMMENT ON COLUMN public.neighborhoods.price_range IS 'Fourchette de prix (min, max, moyenne)';
COMMENT ON COLUMN public.neighborhoods.scores IS 'Scores de qualité de vie (transport, commerce, éducation, sécurité, santé)';

