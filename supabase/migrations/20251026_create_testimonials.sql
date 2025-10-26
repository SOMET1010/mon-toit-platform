-- Création de la table testimonials pour les témoignages clients
-- Date: 2025-10-26
-- Auteur: Manus AI

CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  profession TEXT,
  location TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  quote TEXT NOT NULL,
  photo_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour l'affichage
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON public.testimonials (is_featured, display_order);
CREATE INDEX IF NOT EXISTS idx_testimonials_rating ON public.testimonials (rating DESC);

-- Activer RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Politique: Lecture publique
CREATE POLICY "Testimonials are viewable by everyone"
  ON public.testimonials FOR SELECT
  USING (true);

-- Politique: Seuls les admins peuvent modifier
CREATE POLICY "Only admins can modify testimonials"
  ON public.testimonials FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Commentaires
COMMENT ON TABLE public.testimonials IS 'Témoignages clients pour la landing page';
COMMENT ON COLUMN public.testimonials.is_featured IS 'Afficher sur la page d''accueil';
COMMENT ON COLUMN public.testimonials.display_order IS 'Ordre d''affichage (0 = premier)';

