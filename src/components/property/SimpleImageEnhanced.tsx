import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SimpleImageEnhancedProps {
  src: string | null;
  alt: string;
  className?: string;
  propertyType?: string;
  fallback?: string;
}

// Vraies photos de biens immobiliers à Abidjan
const FALLBACK_IMAGES: Record<string, string> = {
  'appartement': '/property-images/appartement-moderne-abidjan.jpg',
  'villa': '/property-images/villa-luxe-cocody.jpg',
  'studio': '/property-images/studio-plateau.jpg',
  'duplex': '/property-images/duplex-riviera.jpg',
  'maison': '/property-images/maison-yopougon.jpg',
  'default': '/property-images/immeuble-residentiel.jpg'
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

