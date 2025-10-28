# Edge Function: get-mapbox-token

## Description

Cette Edge Function récupère le token Mapbox depuis les Secrets Supabase et l'expose via une API sécurisée.

## URL

```
https://haffcubwactwjpngcpdf.supabase.co/functions/v1/get-mapbox-token
```

## Configuration requise

### 1. Ajouter le Secret MAPBOX_TOKEN dans Supabase

1. Aller sur https://supabase.com/dashboard/project/haffcubwactwjpngcpdf/settings/vault
2. Cliquer sur "New secret"
3. Nom : `MAPBOX_TOKEN`
4. Valeur : Votre token Mapbox (commence par `pk.`)
5. Sauvegarder

### 2. Déployer l'Edge Function

**Option A : Script automatique**
```bash
./deploy-edge-function.sh
```

**Option B : Commandes manuelles**
```bash
# Installer Supabase CLI
npm install -g supabase

# Se connecter
supabase login

# Lier le projet
supabase link --project-ref haffcubwactwjpngcpdf

# Déployer
supabase functions deploy get-mapbox-token --no-verify-jwt
```

## Utilisation

### Frontend (TypeScript)

```typescript
import { supabase } from '@/integrations/supabase/client';

const { data, error } = await supabase.functions.invoke('get-mapbox-token', {
  method: 'GET',
});

if (data && data.token) {
  console.log('Token Mapbox:', data.token);
}
```

### cURL

```bash
curl -X GET \
  'https://haffcubwactwjpngcpdf.supabase.co/functions/v1/get-mapbox-token' \
  -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY'
```

## Réponse

### Succès

```json
{
  "token": "pk.eyJ1Ijoib...",
  "success": true
}
```

### Erreur

```json
{
  "error": "Token Mapbox non configuré dans les Secrets Supabase",
  "hint": "Ajoutez MAPBOX_TOKEN dans les Secrets du projet Supabase",
  "success": false
}
```

## Sécurité

- ✅ Le token n'est jamais exposé côté client
- ✅ CORS configuré pour accepter toutes les origines (à restreindre en production)
- ✅ Pas d'authentification JWT requise (`--no-verify-jwt`) pour simplifier l'usage

## Logs

Pour voir les logs de l'Edge Function :

```bash
supabase functions logs get-mapbox-token
```

## Mise à jour

Pour mettre à jour l'Edge Function après modification du code :

```bash
supabase functions deploy get-mapbox-token --no-verify-jwt
```

