# 🎯 GUIDE DE CONFIGURATION DES DONNÉES DE DÉMONSTRATION

## 📋 Prérequis

Pour que le script fonctionne, vous devez d'abord créer les comptes utilisateurs via l'interface d'inscription de Mon Toit.

## 👥 ÉTAPE 1: Créer les Comptes Utilisateurs

### A. Créer 3 Propriétaires Individuels

1. **Jean-Paul Kouassi** (ID suggéré dans le code: utilisez l'email ci-dessous)
   - Email: `proprietaire1@montoit.ci`
   - Mot de passe: `Demo2024!`
   - Type: Propriétaire
   - Nom complet: `Jean-Paul Kouassi`
   - Ville: `Abidjan`
   - Téléphone: `+225 07 45 23 67 89`

2. **Marie Diabaté**
   - Email: `proprietaire2@montoit.ci`
   - Mot de passe: `Demo2024!`
   - Type: Propriétaire
   - Nom complet: `Marie Diabaté`
   - Ville: `Abidjan`
   - Téléphone: `+225 05 78 90 12 34`

3. **Ismaël Traoré**
   - Email: `proprietaire3@montoit.ci`
   - Mot de passe: `Demo2024!`
   - Type: Propriétaire
   - Nom complet: `Ismaël Traoré`
   - Ville: `Abidjan`
   - Téléphone: `+225 01 23 45 67 89`

### B. Créer 2 Agences Immobilières

4. **Immobilier CI**
   - Email: `agence1@montoit.ci`
   - Mot de passe: `Demo2024!`
   - Type: Agence
   - Nom complet: `Immobilier CI - Agence Premium`
   - Ville: `Abidjan`
   - Téléphone: `+225 27 20 30 40 50`

5. **Abidjan Prestige Homes**
   - Email: `agence2@montoit.ci`
   - Mot de passe: `Demo2024!`
   - Type: Agence
   - Nom complet: `Abidjan Prestige Homes`
   - Ville: `Abidjan`
   - Téléphone: `+225 27 21 31 41 51`

### C. Créer 10 Locataires

**Très Vérifiés (3):**

6. **Aïcha Koné**
   - Email: `locataire1@montoit.ci`
   - Mot de passe: `Demo2024!`
   - Type: Locataire
   - Nom: `Aïcha Koné`
   - Ville: `Abidjan`

7. **David Mensah**
   - Email: `locataire2@montoit.ci`
   - Mot de passe: `Demo2024!`
   - Type: Locataire
   - Nom: `David Mensah`
   - Ville: `Abidjan`

8. **Fatou Bamba**
   - Email: `locataire3@montoit.ci`
   - Mot de passe: `Demo2024!`
   - Type: Locataire
   - Nom: `Fatou Bamba`
   - Ville: `Abidjan`

**Moyennement Vérifiés (4):**

9-12. Créer avec emails: `locataire4@montoit.ci` à `locataire7@montoit.ci`
   - Noms: Yao Kouadio, Sarah Ouattara, Koffi Yao, Aminata Diallo

**Peu Vérifiés (3):**

13-15. Créer avec emails: `locataire8@montoit.ci` à `locataire10@montoit.ci`
   - Noms: Ibrahim Touré, Marie Koffi, Serge N'Guessan

### D. Créer 2 Admins

16. **Admin Principal**
   - Email: `admin@montoit.ci`
   - Mot de passe: `Admin2024!`

17. **Admin Support**
   - Email: `support@montoit.ci`
   - Mot de passe: `Admin2024!`

## 📝 ÉTAPE 2: Récupérer les IDs Utilisateurs

Une fois tous les comptes créés, exécutez cette requête pour récupérer les IDs:

```sql
SELECT id, full_name, user_type, email 
FROM profiles 
JOIN auth.users ON profiles.id = auth.users.id
ORDER BY user_type, full_name;
```

Notez les UUIDs pour chaque utilisateur.

## 🏠 ÉTAPE 3: Script SQL Principal

Remplacez les UUIDs dans le script ci-dessous par les vrais IDs récupérés:

```sql
-- Script disponible dans: demo-data-script.sql
```

## 🎬 ÉTAPE 4: Ordre d'Exécution

1. Créer les comptes via l'interface (ÉTAPE 1)
2. Récupérer les IDs (ÉTAPE 2)
3. Modifier le script SQL avec les bons IDs
4. Exécuter le script SQL complet

## 📊 Données Générées

Le script va créer:
- ✅ 18 propriétés (9 propriétaires + 9 agences)
- ✅ 25 candidatures avec statuts variés
- ✅ 6 baux (dont 2 certifiés ANSUT)
- ✅ Vérifications ONECI/CNAM/Face
- ✅ 20 favoris
- ✅ 15 conversations de messages
- ✅ 30 recherches historiques
- ✅ 10 avis utilisateurs

## 🔐 Comptes de Test Rapides

| Rôle | Email | Mot de passe | Usage |
|------|-------|--------------|-------|
| Propriétaire | `proprietaire1@montoit.ci` | `Demo2024!` | Tester côté propriétaire |
| Agence | `agence1@montoit.ci` | `Demo2024!` | Tester côté agence |
| Locataire vérifié | `locataire1@montoit.ci` | `Demo2024!` | Candidature forte |
| Locataire non vérifié | `locataire8@montoit.ci` | `Demo2024!` | Candidature faible |
| Admin | `admin@montoit.ci` | `Admin2024!` | Gestion plateforme |

## ⚠️ Notes Importantes

1. **Ordre de création** : Respectez l'ordre (utilisateurs → propriétés → candidatures → baux)
2. **Vérifications** : Les vérifications ONECI/CNAM sont simulées pour la démo
3. **Téléphones** : Les numéros de téléphone sont des exemples fictifs
4. **Sécurité** : Changez les mots de passe avant mise en production

## 🚀 Démarrage Rapide (Méthode Alternative)

Si vous voulez éviter la création manuelle, voici un script automatisé (à exécuter avec précaution):

```typescript
// Utiliser le système d'inscription automatique via l'API
// Script disponible dans: scripts/auto-create-demo-users.ts
```
