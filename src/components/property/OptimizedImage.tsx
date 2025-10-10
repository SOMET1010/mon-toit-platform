import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}

export const OptimizedImage = ({ 
  src, 
  alt, 
  priority = false, 
  sizes,
  className 
}: OptimizedImageProps) => {
  const [currentSrc, setCurrentSrc] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // ✅ SÉCURITÉ : Validation de l'URL avant affichage
  const sanitizeUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      // Ne permettre que les URLs Supabase Storage
      if (!urlObj.hostname.includes('supabase.co')) {
        console.error('URL non autorisée:', url);
        return '/placeholder.svg';
      }
      return url;
    } catch {
      return '/placeholder.svg';
    }
  };

  const getLowResSrc = (url: string): string => {
    if (url.includes("supabase")) {
      const separator = url.includes("?") ? "&" : "?";
      return `${url}${separator}quality=10&width=50`;
    }
    return url;
  };

  useEffect(() => {
    const safeSrc = sanitizeUrl(src);
    setIsLoading(true);
    
    const lowResImg = new Image();
    const lowResSrc = getLowResSrc(safeSrc);
    
    lowResImg.onload = () => {
      setCurrentSrc(lowResSrc);
      
      const highResImg = new Image();
      highResImg.onload = () => {
        setCurrentSrc(safeSrc);
        setIsLoading(false);
      };
      highResImg.onerror = () => {
        setIsLoading(false);
      };
      highResImg.src = safeSrc;
    };

    lowResImg.onerror = () => {
      setCurrentSrc(safeSrc);
      setIsLoading(false);
    };

    lowResImg.src = lowResSrc;
  }, [src]);

  return (
    <picture>
      <source
        srcSet={`${currentSrc}?format=webp`}
        type="image/webp"
      />
      <img
        src={currentSrc || src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={cn(
          "transition-opacity duration-500",
          isLoading ? "blur-sm opacity-50" : "blur-0 opacity-100",
          className
        )}
      />
    </picture>
  );
};
