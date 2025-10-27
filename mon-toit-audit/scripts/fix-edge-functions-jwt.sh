#!/bin/bash

# Script de correction des Edge Functions vulnérable
# active la vérification JWT pour les fonctions sensibles

echo "🔧 Correction des Edge Functions - Activation JWT"
echo "=================================================="

# Backup du fichier original
cp supabase/config.toml supabase/config.toml.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backup créé: supabase/config.toml.backup.$(date +%Y%m%d_%H%M%S)"

# Correction des fonctions sensibles
echo "🔒 Activation JWT pour les fonctions sensibles..."

# Fonctions de vérification (CRITIQUES)
sed -i 's/verify_jwt = false/verify_jwt = true/g' supabase/config.toml
echo "✅ Fonctions de vérification corrigées: cnam-verification, face-verification, oneci-verification"

# Fonctions de paiement (CRITIQUES)
sed -i 's/\[functions.mobile-money-payment\]/\[functions.mobile-money-payment\]\nverify_jwt = true/g' supabase/config.toml
echo "✅ Fonction de paiement corrigée: mobile-money-payment"

# Fonctions d'authentification (CRITIQUES)
sed -i 's/\[functions.cryptoneo-auth\]/\[functions.cryptoneo-auth\]\nverify_jwt = true/g' supabase/config.toml
echo "✅ Fonction d'authentification corrigée: cryptoneo-auth"

# Fonctions PDF sensibles
sed -i 's/\[functions.generate-lease-pdf\]/\[functions.generate-lease-pdf\]\nverify_jwt = true/g' supabase/config.toml
echo "✅ Fonction PDF corrigée: generate-lease-pdf"

# Fonctions de scoring
sed -i 's/\[functions.tenant-scoring\]/\[functions.tenant-scoring\]\nverify_jwt = true/g' supabase/config.toml
echo "✅ Fonction de scoring corrigée: tenant-scoring"

# Fonctions d'analyse de marché
sed -i 's/\[functions.analyze-market-trends\]/\[functions.analyze-market-trends\]\nverify_jwt = true/g' supabase/config.toml
echo "✅ Fonction d'analyse corrigée: analyze-market-trends"

echo ""
echo "📊 Statistiques avant/après:"
echo "Avant:"
grep -c "verify_jwt = false" supabase/config.toml.backup.* || echo "0"
echo "Après:"
grep -c "verify_jwt = false" supabase/config.toml || echo "0"

echo ""
echo "🔍 Fonctions maintenant protégées par JWT:"
grep -A1 "verify_jwt = true" supabase/config.toml | grep "^\[" | tr -d '[]'

echo ""
echo "⚠️  Fonctions publiques (sans JWT):"
grep -A1 "verify_jwt = false" supabase/config.toml | grep "^\[" | tr -d '[]'

echo ""
echo "✅ Correction terminée!"
echo "💾 Fichier de configuration mis à jour: supabase/config.toml"
echo "📦 Backup disponible: supabase/config.toml.backup.*"
echo ""
echo "🚀 Actions suivantes:"
echo "   1. Vérifiez les modifications avec: git diff supabase/config.toml"
echo "   2. Déployez avec: supabase functions deploy"
echo "   3. Testez les fonctions protégées"
echo ""
echo "⚠️  IMPORTANT: Vérifiez que les clients envoient un token JWT valide!"