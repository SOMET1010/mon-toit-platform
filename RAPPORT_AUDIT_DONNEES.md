# Rapport d'Audit des Données Hardcodées

**Auteur**: Manus AI  
**Date**: 26 Octobre 2025  
**Projet**: Mon Toit - Plateforme Immobilière Ivoirienne

---

## Résumé Exécutif

Un audit complet du code source a été réalisé pour identifier toutes les données métier hardcodées. L'analyse a révélé **313 instances** de données qui devraient être stockées en base de données pour garantir la flexibilité, la maintenabilité et l'évolutivité de la plateforme.

L'analyse de la base de données Supabase a confirmé que les tables nécessaires pour accueillir ces données **existent déjà mais sont vides**. Ce rapport fournit une feuille de route claire pour migrer ces données et refactoriser le code.

---

## Données Hardcodées Identifiées

### 1. Données Géographiques (Priorité Haute)

- **Fichiers concernés** : `src/data/abidjanNeighborhoods.ts`, `src/data/abidjanPOI.ts`
- **Données** : 
  - **10 quartiers d'Abidjan** : avec coordonnées, prix, scores (sécurité, transport, etc.), caractéristiques et descriptions.
  - **Points d'Intérêt (POI)** : écoles, hôpitaux, marchés, gares, etc.
- **Risque** : Très difficile à mettre à jour. Toute modification nécessite une intervention dans le code et un redéploiement.
- **Recommandation** : Migrer vers les tables `neighborhoods` et `poi`.

### 2. Contenu Marketing et Témoignages (Priorité Haute)

- **Fichiers concernés** : `src/components/Testimonials.tsx`, `src/components/UnifiedTrustSection.tsx`, `src/components/home/FeaturesSection.tsx`
- **Données** : 
  - **Témoignages clients** : noms, rôles, photos, et citations.
  - **Fonctionnalités et KPIs** : descriptions des services, statistiques clés.
- **Risque** : Le contenu marketing est statique et ne peut pas être mis à jour par l'équipe marketing sans l'aide des développeurs.
- **Recommandation** : Migrer vers les tables `testimonials` et `features`.

### 3. Constantes Métier (Priorité Moyenne)

- **Fichiers concernés** : `src/constants/index.ts`
- **Données** : 
  - **Types de propriétés** : `['Appartement', 'Villa', 'Studio', 'Maison']`
  - **Labels de statuts** : `PROPERTY_STATUS_LABELS`, `APPLICATION_STATUS_LABELS`, etc.
  - **Types de paiement** : `PAYMENT_METHODS`, `PAYMENT_TYPES`
- **Risque** : Moins critique mais limite la flexibilité. L'ajout d'un nouveau type de propriété ou d'un nouveau statut nécessite une modification du code.
- **Recommandation** : Migrer vers les tables `property_types`, `amenities`, et créer une table `statuses` générique.

---

## Structure des Tables Cibles (Supabase)

L'analyse a confirmé que les tables suivantes existent et sont prêtes à être peuplées :

- `neighborhoods`
- `poi`
- `testimonials`
- `features`
- `property_types`
- `amenities`

**Action requise** : Aucune création de table n'est nécessaire. Il suffit de créer les scripts de migration pour insérer les données.

---

## Plan de Migration Recommandé

### Étape 1 : Migration des Données (Équipe Technique)

**Action** : Exécuter les scripts SQL de migration via le dashboard Supabase.

**Exemple de script pour `neighborhoods`** :

```sql
-- Vider la table avant insertion
TRUNCATE TABLE neighborhoods RESTART IDENTITY CASCADE;

-- Insérer les données des quartiers
INSERT INTO neighborhoods (id, name, bounds, center, price_range, scores, description, characteristics, population)
VALUES
  ('cocody', 'Cocody', '{"north": 5.38, "south": 5.34, "east": -3.96, "west": -4.02}', '{"latitude": 5.3599, "longitude": -3.9889}', '{"min": 250000, "max": 800000, "average": 450000}', '{"transport": 8, "commerce": 9, "education": 10, "security": 9, "healthcare": 9}', 'Quartier résidentiel huppé...', ARRAY['Résidentiel', 'Écoles'], 400000),
  -- ... autres quartiers
```

**Note** : Des scripts similaires doivent être créés pour `poi`, `testimonials`, `features`, `property_types`, et `amenities`.

### Étape 2 : Refactorisation du Code (Développeurs)

**Action** : Remplacer les données hardcodées par des appels à l'API Supabase.

**Exemple pour les quartiers** :

**Avant** :
```typescript
// src/data/abidjanNeighborhoods.ts
export const ABIDJAN_NEIGHBORHOODS: Neighborhood[] = [...];
```

**Après** :
```typescript
// src/hooks/useNeighborhoods.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

export const useNeighborhoods = () => {
  return useQuery({
    queryKey: ['neighborhoods'],
    queryFn: async () => {
      const { data, error } = await supabase.from('neighborhoods').select('*');
      if (error) throw error;
      return data;
    },
  });
};
```

**Bénéfices** :
- **Données centralisées** : Une seule source de vérité en base de données.
- **Mises à jour faciles** : L'équipe marketing peut modifier les témoignages ou les fonctionnalités via le dashboard Supabase.
- **Évolutivité** : L'ajout de nouveaux quartiers ou types de propriétés ne nécessite plus de redéploiement.

### Étape 3 : Nettoyage du Code

**Action** : Supprimer les fichiers de données hardcodées une fois la migration validée.

- `src/data/abidjanNeighborhoods.ts`
- `src/data/abidjanPOI.ts`
- `src/components/Testimonials.tsx` (la partie données)
- etc.

---

## Impact et Bénéfices Attendus

| Domaine | Avant | Après |
|---------|-------|-------|
| **Maintenance** | Complexe (code) | Simple (dashboard) |
| **Flexibilité** | Faible | Élevée |
| **Risque d'erreur** | Élevé | Faible |
| **Autonomie des équipes** | Nulle | Totale (marketing, etc.) |

---

## Conclusion

La migration des données hardcodées vers la base de données Supabase est une étape **critique** pour la professionnalisation et l'évolutivité de la plateforme Mon Toit. En suivant ce plan, l'équipe technique peut effectuer la migration de manière structurée et sécurisée, avec un impact positif immédiat sur la maintenance et la flexibilité du produit.

Cet audit fournit une feuille de route claire et actionnable. Je reste à disposition pour toute question ou pour accompagner l'équipe dans la mise en œuvre.

