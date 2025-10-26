# Changelog - Mon Toit

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

---

## [3.5.1.1.0] - 2025-10-26

### ✨ Ajouté

- **Système de versioning sémantique** : Mise en place d'un numéro de version à 5 niveaux (MAJOR.MINOR.PATCH.BUILD.REVISION)
- **Hooks React Query pour données métier** :
  - `useNeighborhoods()` - Accès aux quartiers d'Abidjan depuis Supabase
  - `usePOI()` - Accès aux points d'intérêt depuis Supabase
  - `useTestimonials()` - Accès aux témoignages clients depuis Supabase
  - `useFeatures()` - Accès aux fonctionnalités de la plateforme depuis Supabase
- **Migrations SQL** : Scripts de création des tables `neighborhoods`, `poi`, `testimonials`, `features`
- **Guide de migration** : Documentation complète pour migrer les données hardcodées vers Supabase
- **Composant Version** : Affichage de la version dans l'interface utilisateur

### 🎨 Modifié

- **Palette de couleurs optimisée** : Nouvelle palette harmonieuse alignée avec l'identité ivoirienne
  - Orange Ivoirien (#F77F00) comme couleur primaire
  - Vert Émeraude (#009E60) comme couleur secondaire
  - Terracotta Doux (#D96548) comme couleur d'accent
- **Carte Mapbox harmonisée** : Couleurs des markers et clusters alignées avec la nouvelle palette
- **Testimonials.tsx** : Refactorisé pour utiliser `useFeaturedTestimonials()` au lieu de données hardcodées
- **FeaturesSection.tsx** : Refactorisé pour utiliser `useHighlightedFeatures()` au lieu de données hardcodées

### 🐛 Corrigé

- **Imports Supabase** : Correction des chemins d'import (`@/lib/supabase` au lieu de `@/lib/supabaseClient`)
- **Erreurs de syntaxe JSX** : Correction dans Search.tsx

### 📚 Documentation

- **RAPPORT_AUDIT_DONNEES.md** : Audit complet des 313 données hardcodées identifiées
- **GUIDE_MIGRATION_DONNEES.md** : Guide pas à pas pour migrer les données vers Supabase
- **RAPPORT_HARMONISATION_CARTE.md** : Rapport sur l'harmonisation de la carte Mapbox
- **PALETTE_OPTIMISEE.md** : Documentation de la nouvelle palette de couleurs
- **ILLUSTRATIONS_MANIFEST.md** : Manifeste des 20 illustrations personnalisées

### 🚀 Déploiement

- Tous les changements ont été commités et poussés sur GitHub
- Build testé et validé

---

## Format du Versioning

Le numéro de version suit le format **MAJOR.MINOR.PATCH.BUILD.REVISION** :

- **MAJOR** : Changements incompatibles avec les versions précédentes
- **MINOR** : Nouvelles fonctionnalités rétrocompatibles
- **PATCH** : Corrections de bugs rétrocompatibles
- **BUILD** : Numéro de build incrémenté automatiquement
- **REVISION** : Révisions mineures ou hotfixes

---

## Légende des Emojis

- ✨ **Ajouté** : Nouvelles fonctionnalités
- 🎨 **Modifié** : Changements visuels ou d'interface
- 🐛 **Corrigé** : Corrections de bugs
- 📚 **Documentation** : Ajouts ou modifications de documentation
- 🚀 **Déploiement** : Informations de déploiement
- ⚠️ **Déprécié** : Fonctionnalités obsolètes
- 🗑️ **Supprimé** : Fonctionnalités retirées
- 🔒 **Sécurité** : Corrections de vulnérabilités

