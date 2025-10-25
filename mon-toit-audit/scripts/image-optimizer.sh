#!/bin/bash

# Script de compression automatique d'images - Mon Toit
# Usage: ./scripts/image-optimizer.sh [options]

set -e

echo "🖼️  Optimiseur d'Images Mon Toit - $(date)"
echo "====================================="

# Couleurs pour l'output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Configuration par défaut
QUALITY=85
MAX_WIDTH=1920
MAX_HEIGHT=1080
CONVERT_TO_WEBP=false
DRY_RUN=false
DIRECTORIES=("public/images" "src/assets" "public/icons")

# Traitement des arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --quality)
            QUALITY="$2"
            shift 2
            ;;
        --max-width)
            MAX_WIDTH="$2"
            shift 2
            ;;
        --max-height)
            MAX_HEIGHT="$2"
            shift 2
            ;;
        --webp)
            CONVERT_TO_WEBP=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --dir)
            DIRECTORIES+=("$2")
            shift 2
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --quality NUM     Qualité de compression (1-100, default: 85)"
            echo "  --max-width NUM   Largeur maximale en pixels (default: 1920)"
            echo "  --max-height NUM  Hauteur maximale en pixels (default: 1080)"
            echo "  --webp            Convertir en WebP"
            echo "  --dry-run         Simuler sans modifier les fichiers"
            echo "  --dir PATH        Ajouter un répertoire à traiter"
            echo "  --help            Afficher cette aide"
            exit 0
            ;;
        *)
            print_error "Option inconnue: $1"
            exit 1
            ;;
    esac
done

print_info "Configuration:"
echo "  Qualité: $QUALITY%"
echo "  Dimensions max: ${MAX_WIDTH}x${MAX_HEIGHT}"
echo "  Conversion WebP: $CONVERT_TO_WEBP"
echo "  Mode simulation: $DRY_RUN"
echo ""

# Vérifier les prérequis
check_prerequisites() {
    print_info "Vérification des outils..."
    
    if ! command -v convert &> /dev/null; then
        if ! command -v magick &> /dev/null; then
            print_error "ImageMagick n'est pas installé"
            print_info "Installation: sudo apt-get install imagemagick (Linux) ou brew install imagemagick (macOS)"
            exit 1
        else
            CONVERT_CMD="magick convert"
        fi
    else
        CONVERT_CMD="convert"
    fi
    
    if ! command -v cwebp &> /dev/null && [ "$CONVERT_TO_WEBP" = true ]; then
        print_warning "webp non installé, conversion WebP ignorée"
        CONVERT_TO_WEBP=false
    fi
    
    print_success "Outils vérifiés"
}

# Fonction pour obtenir la taille d'un fichier
get_file_size() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        stat -f%z "$1" 2>/dev/null || echo 0
    else
        stat -c%s "$1" 2>/dev/null || echo 0
    fi
}

# Fonction pour convertir la taille en format lisible
bytes_to_size() {
    local bytes=$1
    if [[ $bytes -lt 1024 ]]; then
        echo "${bytes} B"
    elif [[ $bytes -lt 1048576 ]]; then
        echo "$(($bytes / 1024)) KB"
    else
        echo "$(($bytes / 1048576)) MB"
    fi
}

# Optimiser une image
optimize_image() {
    local input_file="$1"
    local output_file="$1"
    local temp_file=""
    
    # Obtenir la taille originale
    local original_size=$(get_file_size "$input_file")
    
    # Créer un fichier temporaire pour les modifications
    if [ "$input_file" != "$output_file" ]; then
        temp_file="${input_file}.tmp"
        cp "$input_file" "$temp_file"
        output_file="$temp_file"
    fi
    
    # Redimensionner si nécessaire
    local dimensions=$($CONVERT_CMD "$input_file" -format "%wx%h" info: 2>/dev/null || echo "0x0")
    
    if [ "$dimensions" != "0x0" ]; then
        local width=$(echo $dimensions | cut -d'x' -f1)
        local height=$(echo $dimensions | cut -d'x' -f2)
        
        if [[ $width -gt $MAX_WIDTH ]] || [[ $height -gt $MAX_HEIGHT ]]; then
            $CONVERT_CMD "$input_file" \
                -resize "${MAX_WIDTH}x${MAX_HEIGHT}>" \
                -quality $QUALITY \
                "$output_file" 2>/dev/null || {
                print_warning "Erreur lors du redimensionnement de $input_file"
                return 1
            }
        else
            # Juste optimiser la qualité
            $CONVERT_CMD "$input_file" \
                -quality $QUALITY \
                "$output_file" 2>/dev/null || {
                print_warning "Erreur lors de l'optimisation de $input_file"
                return 1
            }
        fi
    fi
    
    # Convertir en WebP si demandé
    if [ "$CONVERT_TO_WEBP" = true ]; then
        local webp_file="${output_file%.*}.webp"
        cwebp -q $QUALITY "$input_file" -o "$webp_file" 2>/dev/null || {
            print_warning "Erreur lors de la conversion WebP de $input_file"
        }
    fi
    
    # Calculer la nouvelle taille
    local new_size=$(get_file_size "$output_file")
    local savings=$((original_size - new_size))
    local savings_percent=$((savings * 100 / original_size))
    
    # Afficher les résultats
    if [[ $DRY_RUN == false ]]; then
        if [[ $savings -gt 0 ]]; then
            print_success "$(basename $input_file): $(bytes_to_size $original_size) → $(bytes_to_size $new_size) (-${savings_percent}%)"
        else
            print_warning "$(basename $input_file): $(bytes_to_size $original_size) → $(bytes_to_size $new_size) (pas d'amélioration)"
        fi
        
        # Remplacer le fichier original
        if [[ "$temp_file" != "" ]] && [[ "$output_file" != "$input_file" ]]; then
            mv "$output_file" "$input_file"
        fi
    else
        if [[ $savings -gt 0 ]]; then
            print_info "[SIMULATION] $(basename $input_file): $(bytes_to_size $original_size) → $(bytes_to_size $new_size) (-${savings_percent}%)"
        else
            print_info "[SIMULATION] $(basename $input_file): $(bytes_to_size $original_size) → $(bytes_to_size $new_size)"
        fi
    fi
    
    # Nettoyer le fichier temporaire
    [[ -f "$temp_file" ]] && rm -f "$temp_file"
    
    return 0
}

# Traiter un répertoire
process_directory() {
    local dir="$1"
    
    if [[ ! -d "$dir" ]]; then
        print_warning "Répertoire non trouvé: $dir"
        return 0
    fi
    
    print_info "Traitement de $dir..."
    
    local processed=0
    local total_saved=0
    
    # Traiter les images JPG/JPEG
    while IFS= read -r -d '' file; do
        if optimize_image "$file"; then
            ((processed++))
        fi
    done < <(find "$dir" -type f \( -iname "*.jpg" -o -iname "*.jpeg" \) -print0)
    
    # Traiter les images PNG
    while IFS= read -r -d '' file; do
        if optimize_image "$file"; then
            ((processed++))
        fi
    done < <(find "$dir" -type f -iname "*.png" -print0)
    
    print_success "Traitement terminé pour $dir: $processed images optimisées"
}

# Générer un rapport
generate_report() {
    local total_original=0
    local total_optimized=0
    local total_savings=0
    
    echo ""
    print_info "📊 RAPPORT D'OPTIMISATION:"
    echo "  Qualité utilisée: ${QUALITY}%"
    echo "  Dimensions max: ${MAX_WIDTH}x${MAX_HEIGHT}"
    echo "  Conversion WebP: $CONVERT_TO_WEBP"
    echo ""
    
    # Afficher le résumé des répertoires traités
    for dir in "${DIRECTORIES[@]}"; do
        if [[ -d "$dir" ]]; then
            echo "📁 $dir"
            local file_count=$(find "$dir" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) | wc -l)
            echo "  Images trouvées: $file_count"
        fi
    done
    
    echo ""
    print_info "💡 CONSEILS D'OPTIMISATION:"
    echo "  • Utiliser le lazy loading pour les images"
    echo "  • Implémenter le responsive images (srcset)"
    echo "  • Précharger les images critiques"
    echo "  • Utiliser des placeholders pendant le chargement"
    echo ""
}

# Fonction principale
main() {
    echo ""
    print_info "🚀 DÉBUT DE L'OPTIMISATION"
    echo ""
    
    check_prerequisites
    
    if [[ $DRY_RUN == true ]]; then
        print_warning "MODE SIMULATION - Aucun fichier ne sera modifié"
        echo ""
    fi
    
    local total_processed=0
    
    # Traiter chaque répertoire
    for dir in "${DIRECTORIES[@]}"; do
        if [[ -d "$dir" ]]; then
            process_directory "$dir"
            ((total_processed++))
        fi
    done
    
    if [[ $total_processed -eq 0 ]]; then
        print_warning "Aucun répertoire valide trouvé"
        print_info "Répertoires recherchés:"
        for dir in "${DIRECTORIES[@]}"; do
            echo "  - $dir"
        done
    fi
    
    generate_report
    
    if [[ $DRY_RUN == false ]]; then
        print_success "🎉 OPTIMISATION TERMINÉE!"
    else
        print_info "🏃 MODE SIMULATION TERMINÉ"
        print_info "Exécutez sans --dry-run pour appliquer les modifications"
    fi
    
    echo ""
    print_info "Prochaines étapes:"
    echo "  1. Vérifier les images optimisées"
    echo "  2. Tester l'affichage dans l'application"
    echo "  3. Mettre à jour les références d'images si nécessaire"
    echo "  4. Re-construire l'application"
    echo ""
}

# Gestion des signaux
trap 'echo ""; print_warning "Optimisation interrompue"; exit 1' INT TERM

# Exécution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi