# 🚀 GUIDE DE DÉPLOIEMENT COMPLET - MON TOIT 2.0.0

**Version:** 2.0.0 - Optimisée  
**Date:** 25 octobre 2025  
**Environnement:** Production  

---

## 📋 PRÉ-REQUIS

### Outils requis
- Node.js 18+ 
- npm/yarn/pnpm
- Git
- Accès Supabase (CLI et projet)
- Compte Vercel/Netlify (selon choix déploiement)

### Variables d'environnement de production

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Performance & Cache
VITE_CACHE_ENABLED=true
VITE_CACHE_MAX_SIZE=200
VITE_CACHE_DEFAULT_TTL=600000
VITE_PERFORMANCE_MONITORING=true
VITE_LAZY_LOADING=true

# Sentry (Optionnel)
VITE_SENTRY_DSN=your-sentry-dsn
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=your-sentry-project
SENTRY_AUTH_TOKEN=your-sentry-token

# Analytics (Optionnel)
VITE_GA_TRACKING_ID=your-ga-id
```

---

## 🏗️ PROCESSUS DE DÉPLOIEMENT

### Étape 1: Préparation de l'environnement

```bash
# Cloner le repository
git clone https://github.com/your-username/mon-toit-platform.git
cd mon-toit-platform

# Installer les dépendances
npm install

# Vérifier la configuration
npm run validate:config
```

### Étape 2: Configuration de la base de données

```bash
# Se connecter à Supabase CLI
supabase login

# Lier au projet
supabase link --project-ref your-project-id

# Appliquer les migrations
supabase db push

# Déployer les Edge Functions
supabase functions deploy

# Vérifier les RLS policies
supabase db diff
```

### Étape 3: Configuration du cache et optimisations

```bash
# Vérifier la configuration Vite
npm run validate:vite-config

# Tester la pagination intelligente
npm run test:pagination

# Valider le cache adaptatif
npm run test:cache

# Tester l'optimiseur Supabase
npm run test:supabase-optimizer
```

### Étape 4: Build et optimisation

```bash
# Build de production avec optimisations
npm run build

# Analyser la taille du bundle
npm run analyze

# Valider les assets
npm run validate:assets

# Préparer les fichiers de déploiement
npm run prepare:deploy
```

### Étape 5: Tests finaux

```bash
# Tests de performance
npm run test:performance

# Tests de régression
npm run test:regression

# Tests d'accessibilité
npm run test:a11y

# Tests E2E (optionnel)
npm run test:e2e
```

### Étape 6: Déploiement

#### Option A: Vercel (Recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel --prod

# Configurer les variables d'environnement
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
# ... autres variables
```

#### Option B: Netlify

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Déployer
netlify deploy --prod --dir=dist

# Configurer les variables d'environnement
netlify env:set VITE_SUPABASE_URL "your-url"
netlify env:set VITE_SUPABASE_ANON_KEY "your-key"
```

### Étape 7: Post-déploiement

```bash
# Vérifier le déploiement
curl -I https://your-domain.com

# Valider les métriques de performance
npm run validate:metrics

# Surveiller les logs
npm run monitor:logs

# Vérifier le cache
npm run validate:cache-stats
```

---

## ⚙️ CONFIGURATION SPÉCIFIQUE PAR PLATEFORME

### Vercel Configuration

Fichier `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "env": {
    "VITE_SUPABASE_URL": "@vite_supabase_url",
    "VITE_SUPABASE_ANON_KEY": "@vite_supabase_anon_key"
  },
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/sw.js",
      "destination": "/service-worker.js"
    }
  ]
}
```

### Netlify Configuration

Fichier `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Configuration Supabase

Fichier `supabase/config.toml`:

```toml
[api]
enabled = true
port = 54321
schemas = ["public", "graphql_public"]
extra_search_path = ["public"]
max_rows = 1000

[db]
port = 54322
shadow_port = 54320
major_version = 15

[studio]
enabled = true
port = 54323

[inbucket]
enabled = true
port = 54324

[storage]
enabled = true
port = 54325

[auth]
enabled = true
port = 54326

[edge_functions]
enabled = true
port = 54327

[analytics]
enabled = false
port = 54327
vector_port = 54328
```

---

## 🔧 SCRIPTS DE DÉPLOIEMENT

### Script de déploiement automatisé

Fichier `scripts/deploy.sh`:

```bash
#!/bin/bash

set -e

echo "🚀 Déploiement Mon Toit 2.0.0 - Début"

# Variables
ENVIRONMENT=${1:-production}
BUILD_DIR="dist"
VERCEL_TOKEN=${VERCEL_TOKEN:-""}

# Vérifications pré-déploiement
echo "📋 Vérifications pré-déploiement..."

# Vérifier les variables d'environnement
if [ -z "$VITE_SUPABASE_URL" ]; then
    echo "❌ VITE_SUPABASE_URL non définie"
    exit 1
fi

if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "❌ VITE_SUPABASE_ANON_KEY non définie"
    exit 1
fi

# Tests de performance
echo "🧪 Exécution des tests de performance..."
npm run test:performance

if [ $? -ne 0 ]; then
    echo "❌ Tests de performance échoués"
    exit 1
fi

# Build de production
echo "🏗️ Build de production..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build échoué"
    exit 1
fi

# Validation des optimisations
echo "✅ Validation des optimisations..."
./scripts/validate-optimizations.sh

if [ $? -ne 0 ]; then
    echo "❌ Validation des optimisations échouée"
    exit 1
fi

# Déploiement
if [ "$ENVIRONMENT" = "vercel" ]; then
    echo "🌐 Déploiement sur Vercel..."
    vercel --prod
elif [ "$ENVIRONMENT" = "netlify" ]; then
    echo "🌐 Déploiement sur Netlify..."
    netlify deploy --prod --dir=$BUILD_DIR
else
    echo "❌ Environnement non supporté: $ENVIRONMENT"
    exit 1
fi

# Post-déploiement
echo "🔍 Tests post-déploiement..."
sleep 30

# Vérifier que le site est accessible
curl -f https://your-domain.com > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Site accessible"
else
    echo "❌ Site inaccessible"
    exit 1
fi

echo "🎉 Déploiement réussi !"
echo "📊 Métriques disponibles sur:"
echo "  - Performance: https://your-domain.com/performance"
echo "  - Cache stats: Console navigateur"
echo "  - Sentry: https://sentry.io/your-project"
```

### Script de rollback

Fichier `scripts/rollback.sh`:

```bash
#!/bin/bash

DEPLOYMENT_ID=${1:-""}

if [ -z "$DEPLOYMENT_ID" ]; then
    echo "❌ ID de déploiement requis"
    echo "Usage: ./scripts/rollback.sh <deployment-id>"
    exit 1
fi

echo "⏪ Rollback vers le déploiement: $DEPLOYMENT_ID"

# Rollback sur Vercel
vercel rollback $DEPLOYMENT_ID

# Rollback sur Netlify
# netlify rollback $DEPLOYMENT_ID

echo "✅ Rollback terminé"
```

---

## 📊 MONITORING ET MÉTRIQUES

### Métriques de performance à surveiller

1. **Core Web Vitals**
   - LCP (Largest Contentful Paint) < 2.5s
   - FID (First Input Delay) < 100ms
   - CLS (Cumulative Layout Shift) < 0.1

2. **Métriques de cache**
   - Cache hit rate > 85%
   - Cache size < 200 entrées
   - Memory usage < 50MB

3. **Métriques de base de données**
   - Requêtes optimisées < 10 par page
   - Temps de réponse < 200ms
   - Connexions actives < 50

### Configuration Sentry

```javascript
// src/lib/sentry-enhanced.ts
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: 'production',
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Filtrer les erreurs non critiques
    if (event.exception) {
      const error = event.exception.values?.[0];
      if (error?.type === 'ChunkLoadError') {
        return null; // Ignorer les erreurs de chargement de chunks
      }
    }
    return event;
  },
});
```

### Dashboard de métriques

Créer un endpoint `/api/metrics` pour exposer les métriques:

```typescript
// pages/api/metrics.ts
import { globalCache } from '@/lib/adaptive-cache';
import { queryOptimizer } from '@/lib/supabase-optimizer';

export default async function handler(req, res) {
  try {
    const cacheStats = globalCache.getStats();
    const queryStats = queryOptimizer.getCacheStats();
    
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      timestamp: new Date().toISOString(),
      cache: cacheStats,
      queries: queryStats,
      performance: {
        // Ajouter les métriques Web Vitals
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
}
```

---

## 🔒 SÉCURITÉ EN PRODUCTION

### Headers de sécurité

Vérifier que les headers suivants sont présents:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.sentry-cdn.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https: *.supabase.co; connect-src 'self' https: *.supabase.co wss://*.supabase.co https://sentry.io; media-src 'self' blob: https: *.supabase.co; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### Variables d'environnement sensibles

Ne jamais exposer côté client:
- `SUPABASE_SERVICE_ROLE_KEY`
- `SENTRY_AUTH_TOKEN`
- Clés API privées

Utiliser uniquement les variables avec préfixe `VITE_` côté client.

---

## 🚨 PROCÉDURES D'URGENCE

### En cas de problème de performance

1. **Identifier le problème**
   ```bash
   # Vérifier les métriques
   curl https://your-domain.com/api/metrics
   
   # Analyser les logs
   npm run analyze:logs
   ```

2. **Actions correctives**
   ```bash
   # Vider le cache
   globalCache.clear()
   
   # Redémarrer les optimisations
   npm run restart:optimizations
   
   # Rollback si nécessaire
   ./scripts/rollback.sh last-stable
   ```

### En cas d'erreur de cache

```typescript
// Console navigateur pour vider manuellement le cache
if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => {
      caches.delete(name);
    });
  });
}

// Recharger la page
location.reload();
```

---

## 📞 SUPPORT ET CONTACT

### En cas de problème

1. **Vérifier les logs**
   - Console navigateur
   - Sentry dashboard
   - Logs serveur

2. **Contacter l'équipe**
   - Email: tech@mon-toit.ci
   - Urgence: security@mon-toit.ci (24/7)
   - Slack: #tech-support

3. **Documentation**
   - Guide API: `docs/API_OPTIMIZATIONS.md`
   - Rapport final: `RAPPORT_FINAL_OPTIMISATIONS.md`
   - Tests: `tests/performance/`

### Maintenance programmée

- **Jour de maintenance:** Dimanche 2h-4h UTC
- **Communication:** 48h à l'avance
- **Procédure:** Migration + déploiement + validation

---

**✅ Guide de déploiement validé le 25 octobre 2025**  
**🚀 Prêt pour la production - Mon Toit 2.0.0**  
**📞 Support: tech@mon-toit.ci**