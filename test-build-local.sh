#!/bin/bash

echo "🧪 Test du build local de Mon Toit"
echo "=================================="
echo ""

cd /home/ubuntu/mon-toit

# Vérifier que le dossier dist existe
if [ ! -d "dist" ]; then
  echo "❌ Le dossier dist n'existe pas. Lancement du build..."
  NODE_OPTIONS="--max-old-space-size=4096" npm run build
else
  echo "✅ Le dossier dist existe"
fi

echo ""
echo "📊 Analyse du build..."
echo ""

# Vérifier les fichiers critiques
echo "Fichiers critiques :"
[ -f "dist/index.html" ] && echo "  ✅ index.html" || echo "  ❌ index.html MANQUANT"
[ -f "dist/manifest.webmanifest" ] && echo "  ✅ manifest.webmanifest" || echo "  ❌ manifest.webmanifest MANQUANT"
[ -f "dist/sw.js" ] && echo "  ✅ sw.js (Service Worker)" || echo "  ❌ sw.js MANQUANT"

echo ""
echo "Chunks vendors :"
ls -lh dist/assets/*vendor*.js 2>/dev/null | awk '{print "  ✅ " $9 " (" $5 ")"}'

echo ""
echo "Bundle principal :"
ls -lh dist/assets/index-*.js 2>/dev/null | awk '{print "  📦 " $9 " (" $5 ")"}'

echo ""
echo "Taille totale du build :"
du -sh dist/ | awk '{print "  📊 " $1}'

echo ""
echo "🌐 Démarrage du serveur de test local..."
echo "   URL : http://localhost:8080"
echo "   Appuyez sur Ctrl+C pour arrêter"
echo ""

cd dist && python3 -m http.server 8080
