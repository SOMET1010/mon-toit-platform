# Guide Complet de Migration des Données Hardcodées vers Supabase

**Auteur** : Manus AI  
**Date** : 26 Octobre 2025  
**Projet** : Mon Toit - Plateforme Immobilière Ivoirienne  
**Durée estimée** : 30 minutes

---

## Vue d'Ensemble

Ce guide vous accompagne pas à pas pour migrer toutes les données métier actuellement hardcodées dans le code vers la base de données Supabase. Cette migration permettra de gérer le contenu de manière dynamique sans redéploiement.

**Bénéfices** :
- ✅ Mise à jour du contenu sans intervention des développeurs
- ✅ Gestion centralisée des données métier
- ✅ Meilleure évolutivité de la plateforme
- ✅ Réduction des risques d'erreurs

---

## Prérequis

- Accès au Dashboard Supabase : https://supabase.com/dashboard
- Projet Mon Toit sélectionné
- Rôle administrateur sur le projet

---

## Étape 1 : Création des Tables (10 min)

### 1.1 Accéder au SQL Editor

1. Connectez-vous au Dashboard Supabase
2. Sélectionnez le projet **Mon Toit**
3. Dans le menu latéral, cliquez sur **SQL Editor**
4. Cliquez sur **New Query**

### 1.2 Créer la table `neighborhoods`

Copiez-collez le script suivant et cliquez sur **Run** :

```sql
-- Table des quartiers d'Abidjan
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
```

✅ **Vérification** : Vous devriez voir "Success. No rows returned" en vert.

### 1.3 Créer la table `poi`

Nouvelle requête, copiez-collez et exécutez :

```sql
-- Table des Points d'Intérêt d'Abidjan
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

-- Index
CREATE INDEX IF NOT EXISTS idx_poi_location ON public.poi (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_poi_type ON public.poi (type);
CREATE INDEX IF NOT EXISTS idx_poi_neighborhood ON public.poi (neighborhood);

-- RLS
ALTER TABLE public.poi ENABLE ROW LEVEL SECURITY;

CREATE POLICY "POI are viewable by everyone"
  ON public.poi FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify POI"
  ON public.poi FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
```

### 1.4 Créer la table `testimonials`

```sql
-- Table des témoignages clients
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

-- Index
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON public.testimonials (is_featured, display_order);
CREATE INDEX IF NOT EXISTS idx_testimonials_rating ON public.testimonials (rating DESC);

-- RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Testimonials are viewable by everyone"
  ON public.testimonials FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify testimonials"
  ON public.testimonials FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
```

### 1.5 Créer la table `features`

```sql
-- Table des fonctionnalités de la plateforme
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

-- Index
CREATE INDEX IF NOT EXISTS idx_features_category ON public.features (category, display_order);
CREATE INDEX IF NOT EXISTS idx_features_highlighted ON public.features (is_highlighted, display_order);

-- RLS
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Features are viewable by everyone"
  ON public.features FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify features"
  ON public.features FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
```

---

## Étape 2 : Insertion des Données (10 min)

### 2.1 Peupler la table `neighborhoods`

```sql
-- Insertion des 10 quartiers d'Abidjan
INSERT INTO public.neighborhoods (id, name, bounds, center, price_range, scores, description, characteristics, population)
VALUES
  ('cocody', 'Cocody', 
   '{"north": 5.38, "south": 5.34, "east": -3.96, "west": -4.02}'::jsonb,
   '{"latitude": 5.3599, "longitude": -3.9889}'::jsonb,
   '{"min": 250000, "max": 800000, "average": 450000}'::jsonb,
   '{"transport": 8, "commerce": 9, "education": 10, "security": 9, "healthcare": 9}'::jsonb,
   'Quartier résidentiel huppé d''Abidjan, abritant l''université et de nombreuses ambassades.',
   ARRAY['Quartier résidentiel calme', 'Nombreuses écoles internationales', 'Ambassades et institutions', 'Espaces verts', 'Sécurité renforcée'],
   400000),
   
  ('plateau', 'Plateau',
   '{"north": 5.335, "south": 5.31, "east": -4.0, "west": -4.03}'::jsonb,
   '{"latitude": 5.3244, "longitude": -4.0125}'::jsonb,
   '{"min": 300000, "max": 1000000, "average": 550000}'::jsonb,
   '{"transport": 10, "commerce": 10, "education": 8, "security": 9, "healthcare": 8}'::jsonb,
   'Centre d''affaires et administratif d''Abidjan, cœur économique de la Côte d''Ivoire.',
   ARRAY['Centre d''affaires', 'Immeubles modernes', 'Banques et institutions', 'Restaurants haut de gamme', 'Vie nocturne animée'],
   15000),
   
  ('marcory', 'Marcory',
   '{"north": 5.30, "south": 5.27, "east": -3.97, "west": -4.01}'::jsonb,
   '{"latitude": 5.2869, "longitude": -3.9967}'::jsonb,
   '{"min": 150000, "max": 400000, "average": 280000}'::jsonb,
   '{"transport": 7, "commerce": 8, "education": 7, "security": 7, "healthcare": 7}'::jsonb,
   'Quartier mixte résidentiel et commercial, en pleine expansion avec de nombreux centres commerciaux.',
   ARRAY['Centres commerciaux modernes', 'Zone résidentielle en développement', 'Bon rapport qualité-prix', 'Accès facile au Plateau', 'Quartier familial'],
   300000),
   
  ('riviera', 'Riviera',
   '{"north": 5.39, "south": 5.36, "east": -3.94, "west": -3.98}'::jsonb,
   '{"latitude": 5.3736, "longitude": -3.9609}'::jsonb,
   '{"min": 300000, "max": 900000, "average": 550000}'::jsonb,
   '{"transport": 7, "commerce": 8, "education": 9, "security": 9, "healthcare": 8}'::jsonb,
   'Quartier résidentiel moderne et sécurisé, prisé par les expatriés et cadres supérieurs.',
   ARRAY['Résidences modernes', 'Golf et loisirs', 'Écoles internationales', 'Sécurité 24/7', 'Quartier calme'],
   200000),
   
  ('treichville', 'Treichville',
   '{"north": 5.295, "south": 5.275, "east": -3.985, "west": -4.015}'::jsonb,
   '{"latitude": 5.2869, "longitude": -3.9967}'::jsonb,
   '{"min": 120000, "max": 350000, "average": 220000}'::jsonb,
   '{"transport": 9, "commerce": 9, "education": 6, "security": 6, "healthcare": 7}'::jsonb,
   'Quartier populaire et animé, centre culturel avec le marché et la gare routière.',
   ARRAY['Quartier animé', 'Marché traditionnel', 'Vie nocturne', 'Transport facile', 'Prix abordables'],
   150000),
   
  ('yopougon', 'Yopougon',
   '{"north": 5.36, "south": 5.31, "east": -4.06, "west": -4.12}'::jsonb,
   '{"latitude": 5.3369, "longitude": -4.0894}'::jsonb,
   '{"min": 80000, "max": 250000, "average": 150000}'::jsonb,
   '{"transport": 6, "commerce": 7, "education": 6, "security": 5, "healthcare": 6}'::jsonb,
   'Plus grande commune d''Abidjan, quartier populaire avec de nombreux commerces.',
   ARRAY['Quartier populaire', 'Prix très abordables', 'Nombreux commerces', 'Marché important', 'Forte densité'],
   1200000),
   
  ('adjame', 'Adjamé',
   '{"north": 5.37, "south": 5.34, "east": -4.01, "west": -4.04}'::jsonb,
   '{"latitude": 5.3536, "longitude": -4.0236}'::jsonb,
   '{"min": 100000, "max": 300000, "average": 180000}'::jsonb,
   '{"transport": 10, "commerce": 10, "education": 6, "security": 6, "healthcare": 6}'::jsonb,
   'Centre commercial majeur avec le plus grand marché d''Abidjan et la gare routière.',
   ARRAY['Plus grand marché', 'Hub de transport', 'Commerce intense', 'Quartier très animé', 'Prix compétitifs'],
   500000),
   
  ('abobo', 'Abobo',
   '{"north": 5.44, "south": 5.39, "east": -4.0, "west": -4.04}'::jsonb,
   '{"latitude": 5.4167, "longitude": -4.0167}'::jsonb,
   '{"min": 70000, "max": 200000, "average": 120000}'::jsonb,
   '{"transport": 6, "commerce": 7, "education": 5, "security": 5, "healthcare": 6}'::jsonb,
   'Commune populaire du nord d''Abidjan, en pleine expansion urbaine.',
   ARRAY['Quartier en expansion', 'Prix très accessibles', 'Jeune population', 'Commerces locaux', 'Forte croissance'],
   1200000),
   
  ('port-bouet', 'Port-Bouët',
   '{"north": 5.27, "south": 5.23, "east": -3.91, "west": -3.95}'::jsonb,
   '{"latitude": 5.2539, "longitude": -3.9263}'::jsonb,
   '{"min": 100000, "max": 350000, "average": 200000}'::jsonb,
   '{"transport": 9, "commerce": 7, "education": 6, "security": 7, "healthcare": 6}'::jsonb,
   'Quartier abritant l''aéroport international, proche de la mer.',
   ARRAY['Proche aéroport', 'Accès à la plage', 'Zone industrielle', 'Transport international', 'Quartier mixte'],
   250000),
   
  ('deux-plateaux', 'Deux Plateaux',
   '{"north": 5.37, "south": 5.35, "east": -3.99, "west": -4.01}'::jsonb,
   '{"latitude": 5.36, "longitude": -4.0}'::jsonb,
   '{"min": 200000, "max": 600000, "average": 380000}'::jsonb,
   '{"transport": 7, "commerce": 8, "education": 8, "security": 8, "healthcare": 8}'::jsonb,
   'Quartier résidentiel moderne de Cocody, prisé par la classe moyenne supérieure.',
   ARRAY['Résidences modernes', 'Quartier sécurisé', 'Nombreux restaurants', 'Vie nocturne', 'Classe moyenne'],
   150000)
ON CONFLICT (id) DO NOTHING;

-- Vérification
SELECT COUNT(*) as total FROM public.neighborhoods;
```

✅ **Vérification** : Vous devriez voir "10" dans la colonne `total`.

### 2.2 Peupler la table `testimonials`

```sql
-- Insertion des témoignages
INSERT INTO public.testimonials (name, role, profession, location, rating, quote, is_featured, display_order)
VALUES
  ('Kouadio Marc', 'Locataire certifié ANSUT', 'Ingénieur', 'Cocody', 5, 
   'Grâce à Mon Toit, j''ai trouvé mon appartement en 2 semaines. Le processus de certification m''a rassuré et le propriétaire aussi !', 
   true, 1),
   
  ('Aminata K.', 'Locataire', 'Comptable', 'Marcory', 5,
   'Excellente plateforme ! J''ai pu visiter plusieurs biens et le système de paiement mobile est très pratique.',
   true, 2),
   
  ('Kouadio Adjoua', 'Locataire', 'Enseignante', 'Cocody', 5,
   'Mon Toit m''a permis de trouver rapidement un logement de qualité. Le processus de certification ANSUT est un vrai plus.',
   true, 3),
   
  ('Yao Serge', 'Propriétaire', 'Entrepreneur', 'Plateau', 5,
   'En tant que propriétaire, Mon Toit me permet de gérer mes biens facilement et de trouver des locataires fiables.',
   false, 4),
   
  ('Bamba Fatoumata', 'Locataire', 'Étudiante', 'Riviera', 4,
   'Très bon service, j''ai trouvé un studio proche de mon université. Les photos étaient conformes à la réalité.',
   false, 5)
ON CONFLICT DO NOTHING;

-- Vérification
SELECT COUNT(*) as total FROM public.testimonials;
```

### 2.3 Peupler la table `features`

```sql
-- Insertion des fonctionnalités
INSERT INTO public.features (icon, title, description, category, is_highlighted, display_order)
VALUES
  ('ShieldCheck', 'Certification ANSUT', 
   'Tous les baux sont certifiés par l''Autorité Nationale de la Sécurité et de l''Urbanisme de la Terre pour garantir leur légalité.',
   'certification', true, 1),
   
  ('FileCheck', 'Dossier Certifié',
   'Vérification d''identité ONECI, CNAM et biométrique pour des dossiers locataires 100% fiables.',
   'certification', true, 2),
   
  ('Smartphone', 'Paiement Mobile Money',
   'Payez votre loyer via Orange Money, MTN Money, Moov Money ou Wave en toute sécurité.',
   'payment', true, 3),
   
  ('Shield', 'Sécurité Maximale',
   'Vos données personnelles et paiements sont protégés par un chiffrement de niveau bancaire.',
   'security', true, 4),
   
  ('Home', 'Large Choix de Biens',
   'Des milliers de propriétés vérifiées dans tous les quartiers d''Abidjan.',
   'core', false, 5),
   
  ('MessageSquare', 'Messagerie Intégrée',
   'Communiquez directement avec les propriétaires via notre système de messagerie sécurisé.',
   'core', false, 6),
   
  ('MapPin', 'Carte Interactive',
   'Explorez les biens disponibles sur une carte interactive avec les points d''intérêt à proximité.',
   'core', false, 7),
   
  ('Star', 'Avis Vérifiés',
   'Consultez les avis authentiques d''autres locataires pour faire le bon choix.',
   'other', false, 8)
ON CONFLICT DO NOTHING;

-- Vérification
SELECT COUNT(*) as total FROM public.features;
```

---

## Étape 3 : Vérification Finale (2 min)

Exécutez cette requête pour vérifier que toutes les données sont bien insérées :

```sql
SELECT 
  (SELECT COUNT(*) FROM public.neighborhoods) as neighborhoods,
  (SELECT COUNT(*) FROM public.testimonials) as testimonials,
  (SELECT COUNT(*) FROM public.features) as features;
```

**Résultat attendu** :
- neighborhoods: 10
- testimonials: 5
- features: 8

---

## Étape 4 : Prochaines Étapes (Pour les Développeurs)

Une fois les tables créées et peuplées, les développeurs doivent :

1. **Créer les hooks React Query** pour accéder aux données
2. **Refactoriser les composants** pour utiliser les hooks au lieu des données hardcodées
3. **Supprimer les anciens fichiers** de données hardcodées
4. **Tester** que tout fonctionne correctement

Ces étapes seront documentées dans un guide séparé pour les développeurs.

---

## Support

En cas de problème lors de la migration, contactez l'équipe technique ou consultez la documentation Supabase : https://supabase.com/docs

---

**Félicitations ! 🎉** Vos données métier sont maintenant centralisées dans Supabase et peuvent être gérées dynamiquement via le Dashboard.

