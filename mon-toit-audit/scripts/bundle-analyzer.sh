#!/bin/bash

# Script d'analyse et d'optimisation du bundle Mon Toit
# Usage: ./scripts/bundle-analyzer.sh

set -e

echo "🔍 Analyse du Bundle Mon Toit - $(date)"
echo "=================================="

# Couleurs pour l'output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les couleurs
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Vérifier les prérequis
check_prerequisites() {
    print_info "Vérification des prérequis..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js n'est pas installé"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm n'est pas installé"
        exit 1
    fi
    
    if ! command -v npx &> /dev/null; then
        print_error "npx n'est pas disponible"
        exit 1
    fi
    
    print_success "Prérequis vérifiés"
}

# Analyser la taille des dépendances
analyze_dependencies() {
    print_info "Analyse de la taille des dépendances..."
    
    # Créer un script temporaire pour analyser les dépendances
    cat > analyze-deps.js << 'EOF'
const fs = require('fs');
const path = require('path');

// Fonction pour obtenir la taille d'un fichier/dossier
function getSize(dir) {
    let size = 0;
    try {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stats = fs.statSync(filePath);
            if (stats.isDirectory()) {
                size += getSize(filePath);
            } else {
                size += stats.size;
            }
        });
    } catch (error) {
        // Ignorer les erreurs d'accès
    }
    return size;
}

// Fonction pour convertir les bytes en format lisible
function bytesToSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

console.log('📊 Analyse des dépendances principales:\n');

const dependencies = [
    '@capacitor/android',
    '@capacitor/core', 
    '@capacitor/ios',
    'react',
    'react-dom',
    'react-router-dom',
    '@tanstack/react-query',
    '@supabase/supabase-js',
    '@radix-ui/react-dialog',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-select',
    'mapbox-gl',
    'framer-motion',
    'recharts',
    'date-fns',
    'lucide-react'
];

dependencies.forEach(dep => {
    const depPath = path.join(__dirname, 'node_modules', dep);
    if (fs.existsSync(depPath)) {
        const size = getSize(depPath);
        const sizeMB = size / (1024 * 1024);
        
        if (sizeMB > 1) {
            console.log(`🔴 ${dep}: ${bytesToSize(size)} (${sizeMB.toFixed(2)} MB)`);
        } else if (sizeMB > 0.5) {
            console.log(`🟡 ${dep}: ${bytesToSize(size)} (${sizeMB.toFixed(2)} MB)`);
        } else {
            console.log(`🟢 ${dep}: ${bytesToSize(size)}`);
        }
    } else {
        console.log(`❓ ${dep}: Non trouvé`);
    }
});

console.log('\n💡 Recommandations:');
console.log('- Les dépendances > 1MB doivent être optimisées ou remplacées');
console.log('- Considérer le lazy loading pour les composants lourds');
console.log('- Utiliser des alternatives plus légères si possible');
EOF

    node analyze-deps.js
    rm -f analyze-deps.js
    
    print_success "Analyse des dépendances terminée"
}

# Analyser le bundle actuel
analyze_current_bundle() {
    print_info "Analyse du bundle actuel..."
    
    if [ -d "dist" ]; then
        echo ""
        print_info "Taille du build actuel:"
        du -sh dist/* 2>/dev/null | while read line; do
            echo "  $line"
        done
        
        # Calculer la taille totale
        total_size=$(du -sh dist | cut -f1)
        print_info "Taille totale: $total_size"
        
        # Analyser les chunks
        if [ -d "dist/assets" ]; then
            print_info "Analyse des chunks JavaScript:"
            ls -la dist/assets/*.js 2>/dev/null | while read line; do
                size=$(echo $line | awk '{print $5}')
                name=$(echo $line | awk '{print $9}')
                if [ -n "$size" ] && [ "$size" != "size" ]; then
                    if [ "$size" -gt 500000 ]; then
                        echo "  🔴 $(basename $name): $(($size / 1024))KB"
                    elif [ "$size" -gt 200000 ]; then
                        echo "  🟡 $(basename $name): $(($size / 1024))KB"
                    else
                        echo "  🟢 $(basename $name): $(($size / 1024))KB"
                    fi
                fi
            done
        fi
    else
        print_warning "Aucun build trouvé. Exécutez d'abord: npm run build"
    fi
}

# Générer le rapport du bundle avec Vite
generate_bundle_report() {
    print_info "Génération du rapport d'analyse du bundle..."
    
    if command -v npm &> /dev/null; then
        # Build avec analyse
        npm run build:analyze > /dev/null 2>&1
        
        if [ -f "dist/stats.html" ]; then
            print_success "Rapport d'analyse généré: dist/stats.html"
            print_info "Ouvrez le fichier dans votre navigateur pour voir l'analyse détaillée"
            
            # Ouvrir automatiquement si possible
            if command -v open &> /dev/null; then
                open dist/stats.html
            elif command -v xdg-open &> /dev/null; then
                xdg-open dist/stats.html
            fi
        fi
    fi
}

# Analyser les images
analyze_images() {
    print_info "Analyse des images..."
    
    if [ -d "public/images" ]; then
        print_info "Images dans public/images:"
        find public/images -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" -o -iname "*.svg" \) -exec ls -lh {} \; | awk '{print "  " $5 " " $9}' | sort -k1 -hr | head -10
    fi
    
    if [ -d "src/assets" ]; then
        print_info "Images dans src/assets:"
        find src/assets -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" -o -iname "*.svg" \) -exec ls -lh {} \; | awk '{print "  " $5 " " $9}' | sort -k1 -hr | head -10
    fi
    
    print_info "💡 Recommandations pour les images:"
    echo "  - Utiliser WebP pour les photos"
    echo "  - Optimiser la compression"
    echo "  - Implémenter le lazy loading"
    echo "  - Utiliser des sprites pour les icônes"
}

# Vérifier le code splitting
check_code_splitting() {
    print_info "Vérification du code splitting..."
    
    if [ -f "vite.config.ts" ]; then
        if grep -q "manualChunks" vite.config.ts; then
            print_success "Code splitting configuré dans vite.config.ts"
            print_info "Chunks configurés:"
            grep -A 10 "manualChunks" vite.config.ts | grep -E "^\s+'" | while read line; do
                echo "  $line"
            done
        else
            print_warning "Aucun code splitting manuel configuré"
        fi
    else
        print_error "vite.config.ts non trouvé"
    fi
}

# Générer des recommandations
generate_recommendations() {
    echo ""
    print_info "📋 RECOMMANDATIONS D'OPTIMISATION:"
    echo ""
    echo "🎯 Bundle Size:"
    echo "  • Réduire les dépendances lourdes (>1MB)"
    echo "  • Implémenter le lazy loading pour les composants UI"
    echo "  • Utiliser des alternatives plus légères"
    echo "  • Optimiser les images (WebP, compression)"
    echo ""
    echo "⚡ Performance:"
    echo "  • Activer le code splitting"
    echo "  • Implémenter le cache stratégique"
    echo "  • Utiliser le préchargement des ressources critiques"
    echo ""
    echo "📱 Mobile:"
    echo "  • Tester sur différents appareils"
    echo "  • Optimiser pour les connexions lentes"
    echo "  • Réduire la taille initiale du bundle"
    echo ""
    echo "🔧 Commandes utiles:"
    echo "  npm run build:analyze    # Analyse du bundle"
    echo "  npm run bundle:stats     # Statistiques détaillées"
    echo "  npm run test:coverage    # Couverture de tests"
}

# Fonction principale
main() {
    echo ""
    print_info "🚀 DÉBUT DE L'ANALYSE"
    echo ""
    
    check_prerequisites
    analyze_dependencies
    analyze_current_bundle
    analyze_images
    check_code_splitting
    generate_recommendations
    
    echo ""
    print_success "🎉 ANALYSE TERMINÉE!"
    echo ""
    print_info "Prochaines étapes:"
    echo "  1. Exécuter 'npm run build:analyze' pour une analyse complète"
    echo "  2. Consulter le rapport HTML généré"
    echo "  3. Implémenter les optimisations recommandées"
    echo "  4. Re-tester après les modifications"
    echo ""
}

# Exécution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi