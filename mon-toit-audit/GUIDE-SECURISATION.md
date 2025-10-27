# 🔐 Guide de Configuration Sécurisée - Mon Toit

## 📋 Corrections Critiques Appliquées

### 1. Sécurisation des Clés API ✅

**Problème** : Le fichier `.env.example` contenait des clés API réelles.

**Solution** : 
- ✅ Clés API remplacées par des tokens démo explicites
- ✅ Variables clairement marquées avec `YOUR_*_HERE`
- ✅ `.env.example` est dans `.gitignore` (déjà configuré)

**Instructions** :
1. Copiez `.env.example` vers `.env`
2. Remplacez toutes les valeurs `YOUR_*_HERE` par vos vraies clés :
   - `VITE_SUPABASE_URL` : URL de votre projet Supabase
   - `VITE_SUPABASE_PUBLISHABLE_KEY` : Clé publique Supabase
   - `VITE_MAPBOX_PUBLIC_TOKEN` : Token public Mapbox
   - `VITE_SENTRY_DSN` : DSN Sentry (optionnel)

### 2. Correction CSP pour Workers Blob ✅

**Problème** : Erreur Content-Security-Policy bloquant les workers blob.

**Solution** : 
- ✅ Ajout de `blob:` dans `script-src` du CSP
- ✅ Les workers peuvent maintenant fonctionner correctement

**Vérification** :
- ✅ `img-src` : `data: blob: https:`
- ✅ `script-src` : `'self' 'unsafe-inline' 'unsafe-eval' blob:`
- ✅ `media-src` : `blob:`

### 3. Activation Sentry en Production ✅

**Problème** : Sentry était désactivé pour réduire la taille du build.

**Solution** :
- ✅ Sentry réactivé uniquement en mode production
- ✅ Variables d'environnement requises :
  - `SENTRY_ORG` : Nom de l'organisation Sentry
  - `SENTRY_PROJECT` : Nom du projet Sentry
  - `SENTRY_AUTH_TOKEN` : Token d'authentification Sentry

**Configuration Sentry** :

```bash
# Variables d'environnement à définir
SENTRY_ORG=votre-organisation
SENTRY_PROJECT=mon-toit
SENTRY_AUTH_TOKEN=votre_token_auth
```

## 🚀 Déploiement Sécurisé

### Variables d'Environnement pour Netlify :

Dans Netlify → Site settings → Environment variables :

```
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=votre_cle_publique
VITE_MAPBOX_PUBLIC_TOKEN=pk.votre_token_mapbox
VITE_SENTRY_DSN=https://votre-dsn@sentry.io/projet
SENTRY_ORG=votre-org
SENTRY_PROJECT=mon-toit
SENTRY_AUTH_TOKEN=votre-token
```

### Test de la Configuration :

1. **Build local** :
   ```bash
   npm run build
   ```

2. **Vérification Sentry** :
   ```bash
   # Vérifier que Sentry est activé en prod
   grep -n "sentryVitePlugin" vite.config.ts
   ```

3. **Test workers blob** :
   - Ouvrir les DevTools
   - Vérifier que les workers se chargent sans erreur CSP

## 📊 Monitoring

### Sentry Dashboard :
- Accès : https://sentry.io
- Surveillance des erreurs JavaScript
- Performance monitoring activé

### Netlify Analytics :
- Surveillance des erreurs 4xx/5xx
- Monitoring des performances

## ⚠️ Points d'Attention

1. **Ne jamais committer les fichiers `.env`**
2. **Tester en production avec les vraies clés**
3. **Surveiller les erreurs Sentry**
4. **Mettre à jour les tokens régulièrement**

## 🔄 Processus de Mise à Jour

1. Modifier `.env.example` avec de nouveaux tokens démo
2. Committer les changements
3. Mettre à jour les variables dans Netlify
4. Redéployer
5. Vérifier le monitoring

---

**Date de création** : 2025-10-25  
**Responsable** : Équipe Mon Toit  
**Prochaine révision** : 2025-11-25
