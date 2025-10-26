-- Migration: Peupler la table neighborhoods avec les données d'Abidjan
-- Date: 2025-10-26
-- Auteur: Manus AI

-- Vider la table si elle contient déjà des données
TRUNCATE TABLE neighborhoods CASCADE;

-- Insérer les 10 quartiers d'Abidjan
INSERT INTO neighborhoods (id, name, bounds_north, bounds_south, bounds_east, bounds_west, center_latitude, center_longitude, price_min, price_max, price_average, score_transport, score_commerce, score_education, score_security, score_healthcare, description, characteristics, population, created_at, updated_at)
VALUES
  -- Cocody
  ('cocody', 'Cocody', 5.3800, 5.3400, -3.9600, -4.0200, 5.3599, -3.9889, 250000, 800000, 450000, 8, 9, 10, 9, 9, 'Quartier résidentiel huppé d''Abidjan, abritant l''université et de nombreuses ambassades.', ARRAY['Quartier résidentiel calme', 'Nombreuses écoles internationales', 'Ambassades et institutions', 'Espaces verts', 'Sécurité renforcée'], 400000, NOW(), NOW()),
  
  -- Plateau
  ('plateau', 'Plateau', 5.3350, 5.3100, -4.0000, -4.0300, 5.3244, -4.0125, 300000, 1000000, 550000, 10, 10, 8, 9, 8, 'Centre d''affaires et administratif d''Abidjan, cœur économique de la Côte d''Ivoire.', ARRAY['Centre d''affaires', 'Immeubles modernes', 'Banques et institutions', 'Restaurants haut de gamme', 'Vie nocturne animée'], 15000, NOW(), NOW()),
  
  -- Marcory
  ('marcory', 'Marcory', 5.3000, 5.2700, -3.9700, -4.0100, 5.2869, -3.9967, 150000, 400000, 280000, 7, 8, 7, 7, 7, 'Quartier mixte résidentiel et commercial, en pleine expansion avec de nombreux centres commerciaux.', ARRAY['Centres commerciaux modernes', 'Zone résidentielle en développement', 'Bon rapport qualité-prix', 'Accès facile au Plateau', 'Quartier familial'], 300000, NOW(), NOW()),
  
  -- Riviera
  ('riviera', 'Riviera', 5.3900, 5.3600, -3.9400, -3.9800, 5.3736, -3.9609, 300000, 900000, 550000, 7, 8, 9, 9, 8, 'Quartier résidentiel moderne et sécurisé, prisé par les expatriés et cadres supérieurs.', ARRAY['Résidences modernes', 'Golf et loisirs', 'Écoles internationales', 'Sécurité 24/7', 'Quartier calme'], 200000, NOW(), NOW()),
  
  -- Treichville
  ('treichville', 'Treichville', 5.2950, 5.2750, -3.9850, -4.0150, 5.2869, -3.9967, 120000, 350000, 220000, 9, 9, 6, 6, 7, 'Quartier populaire et animé, centre culturel avec le marché et la gare routière.', ARRAY['Quartier animé', 'Marché traditionnel', 'Vie nocturne', 'Transport facile', 'Prix abordables'], 150000, NOW(), NOW()),
  
  -- Yopougon
  ('yopougon', 'Yopougon', 5.3600, 5.3100, -4.0600, -4.1200, 5.3369, -4.0894, 80000, 250000, 150000, 6, 7, 6, 5, 6, 'Plus grande commune d''Abidjan, quartier populaire avec de nombreux commerces.', ARRAY['Quartier populaire', 'Prix très abordables', 'Nombreux commerces', 'Marché important', 'Forte densité'], 1200000, NOW(), NOW()),
  
  -- Adjamé
  ('adjame', 'Adjamé', 5.3700, 5.3400, -4.0100, -4.0400, 5.3536, -4.0236, 100000, 300000, 180000, 10, 10, 6, 6, 6, 'Centre commercial majeur avec le plus grand marché d''Abidjan et la gare routière.', ARRAY['Plus grand marché', 'Hub de transport', 'Commerce intense', 'Quartier très animé', 'Prix compétitifs'], 500000, NOW(), NOW()),
  
  -- Abobo
  ('abobo', 'Abobo', 5.4400, 5.3900, -4.0000, -4.0400, 5.4167, -4.0167, 70000, 200000, 120000, 6, 7, 5, 5, 6, 'Commune populaire du nord d''Abidjan, en pleine expansion urbaine.', ARRAY['Quartier en expansion', 'Prix très accessibles', 'Jeune population', 'Commerces locaux', 'Forte croissance'], 1200000, NOW(), NOW()),
  
  -- Port-Bouët
  ('port-bouet', 'Port-Bouët', 5.2700, 5.2300, -3.9100, -3.9500, 5.2539, -3.9263, 100000, 350000, 200000, 9, 7, 6, 7, 6, 'Quartier abritant l''aéroport international, proche de la mer.', ARRAY['Proche aéroport', 'Accès à la plage', 'Zone industrielle', 'Transport international', 'Quartier mixte'], 250000, NOW(), NOW()),
  
  -- Deux Plateaux
  ('deux-plateaux', 'Deux Plateaux', 5.3700, 5.3500, -3.9900, -4.0100, 5.3600, -4.0000, 200000, 600000, 380000, 7, 8, 8, 8, 8, 'Quartier résidentiel moderne de Cocody, prisé par la classe moyenne supérieure.', ARRAY['Résidences modernes', 'Quartier sécurisé', 'Nombreux restaurants', 'Vie nocturne', 'Classe moyenne'], 150000, NOW(), NOW());

-- Vérifier l'insertion
SELECT COUNT(*) as total_neighborhoods FROM neighborhoods;

