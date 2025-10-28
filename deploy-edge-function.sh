#!/bin/bash

# Script de déploiement de l'Edge Function Mapbox sur Supabase
# Usage: ./deploy-edge-function.sh

set -e

echo "🚀 Déploiement de l'Edge Function get-mapbox-token sur Supabase"
echo ""

# Vérifier si Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI n'est pas installé"
    echo "📦 Installation de Supabase CLI..."
    npm install -g supabase
fi

# Vérifier la connexion
echo "🔐 Vérification de la connexion Supabase..."
if ! supabase projects list &> /dev/null; then
    echo "⚠️  Non connecté à Supabase"
    echo "🔑 Connexion à Supabase..."
    echo "   Vous allez être redirigé vers le navigateur pour vous connecter."
    supabase login
fi

# Lier le projet si nécessaire
echo "🔗 Liaison avec le projet Supabase..."
if [ ! -f ".supabase/config.toml" ]; then
    echo "   Liaison du projet haffcubwactwjpngcpdf..."
    supabase link --project-ref haffcubwactwjpngcpdf
else
    echo "   ✅ Projet déjà lié"
fi

# Déployer l'Edge Function
echo "📤 Déploiement de l'Edge Function..."
supabase functions deploy get-mapbox-token --no-verify-jwt

echo ""
echo "✅ Edge Function déployée avec succès !"
echo ""
echo "📋 Prochaines étapes :"
echo "   1. Vérifier que le Secret MAPBOX_TOKEN est configuré dans Supabase"
echo "   2. Tester l'Edge Function : https://haffcubwactwjpngcpdf.supabase.co/functions/v1/get-mapbox-token"
echo "   3. Déployer le frontend sur Netlify"
echo ""

