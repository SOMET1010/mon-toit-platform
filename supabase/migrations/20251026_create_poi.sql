-- Création de la table poi (Points d'Intérêt) pour Abidjan
-- Date: 2025-10-26
-- Auteur: Manus AI

CREATE TABLE IF NOT EXISTS public.poi (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('school', 'transport', 'hospital', 'market', 'mall', 'restaurant')),
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  neighborhood TEXT REFERENCES public.neighborhoods(id),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les recherches géographiques
CREATE INDEX IF NOT EXISTS idx_poi_location ON public.poi (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_poi_type ON public.poi (type);
CREATE INDEX IF NOT EXISTS idx_poi_neighborhood ON public.poi (neighborhood);

-- Activer RLS
ALTER TABLE public.poi ENABLE ROW LEVEL SECURITY;

-- Politique: Lecture publique
CREATE POLICY "POI are viewable by everyone"
  ON public.poi FOR SELECT
  USING (true);

-- Politique: Seuls les admins peuvent modifier
CREATE POLICY "Only admins can modify POI"
  ON public.poi FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Commentaires
COMMENT ON TABLE public.poi IS 'Points d''intérêt d''Abidjan (écoles, hôpitaux, transports, etc.)';
COMMENT ON COLUMN public.poi.type IS 'Type de POI: school, transport, hospital, market, mall, restaurant';

