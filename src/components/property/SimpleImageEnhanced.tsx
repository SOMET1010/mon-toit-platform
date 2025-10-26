import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SimpleImageEnhancedProps {
  src: string | null;
  alt: string;
  className?: string;
  propertyType?: string;
  fallback?: string;
}

// URLs Supabase Storage - CDN rapide et fiable
// Les images sont hébergées sur Supabase Storage (bucket public: property-images)
const SUPABASE_URL = 'https://btxhuqtirylvkgvoutoc.supabase.co';
const STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public/property-images`;

// Vraies photos de biens immobiliers à Abidjan
const FALLBACK_IMAGES: Record<string, string> = {
  'appartement': `${STORAGE_BASE}/appartement-moderne-abidjan.jpg`,
  'villa': `${STORAGE_BASE}/villa-luxe-cocody.jpg`,
  'studio': `${STORAGE_BASE}/studio-plateau.jpg`,
  'duplex': `${STORAGE_BASE}/duplex-riviera.jpg`,
  'maison': `${STORAGE_BASE}/maison-yopougon.jpg`,
  'default': `${STORAGE_BASE}/immeuble-residentiel.jpg`
};

/**
 * Composant d'image amélioré avec fallback intelligent
 * Utilise de vraies photos de biens immobiliers à Abidjan si l'image source est invalide
 */
export const SimpleImageEnhanced = ({
  src,
  alt,
  className,
  propertyType = 'default',
  fallback
}: SimpleImageEnhancedProps) => {
  // Déterminer l'image de fallback basée sur le type de propriété
  const defaultFallback = FALLBACK_IMAGES[propertyType.toLowerCase()] || FALLBACK_IMAGES.default;
  const finalFallback = fallback || defaultFallback;

  const [currentSrc, setCurrentSrc] = useState<string>(finalFallback);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Si pas de src ou src invalide, utiliser le fallback immédiatement
    if (!src || typeof src !== 'string' || src.trim() === '') {
      console.log('SimpleImageEnhanced: No valid src, using fallback', { 
        propertyType, 
        fallback: finalFallback 
      });
      setCurrentSrc(finalFallback);
      setIsLoading(false);
      setHasError(false); // Pas d'erreur, juste pas d'image source
      return;
    }

    setIsLoading(true);
    setHasError(false);
    
    // Tester si l'URL source est accessible
    const img = new Image();
    
    img.onload = () => {
      console.log('SimpleImageEnhanced: Source image loaded successfully', { src });
      setCurrentSrc(src);
      setIsLoading(false);
      setHasError(false);
    };
    
    img.onerror = (error) => {
      console.warn('SimpleImageEnhanced: Source image failed, using fallback', { 
        src, 
        propertyType,
        fallback: finalFallback,
        error 
      });
      setCurrentSrc(finalFallback);
      setIsLoading(false);
      setHasError(false); // Pas d'erreur visible pour l'utilisateur, on a un fallback
    };
    
    // Commencer le chargement
    img.src = src;
  }, [src, finalFallback, propertyType]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={cn(
        "transition-opacity duration-300 w-full h-full object-cover object-center",
        isLoading ? "opacity-70" : "opacity-100",
        className
      )}
      loading="lazy"
      onError={(e) => {
        // Dernier recours si même le fallback échoue
        console.error('SimpleImageEnhanced: Fallback image also failed', { 
          currentSrc,
          propertyType 
        });
        // Ne rien faire, l'image cassée s'affichera
      }}
    />
  );
};

