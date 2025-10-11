import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { logger } from '@/services/logger';

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
  const [isVisible, setIsVisible] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // ✅ SÉCURITÉ : Validation de l'URL avant affichage
  const sanitizeUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      // Ne permettre que les URLs Supabase Storage
      if (!urlObj.hostname.includes('supabase.co')) {
        logger.warn('Unauthorized URL attempted', { hostname: urlObj.hostname });
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

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  useEffect(() => {
    if (!isVisible) return;

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
  }, [src, isVisible]);

  return (
    <div ref={imgRef as any}>
      {isVisible && currentSrc ? (
        <picture>
          <source
            srcSet={`${currentSrc}?format=webp`}
            type="image/webp"
          />
          <img
            src={currentSrc}
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
      ) : (
        <div className={cn("bg-muted animate-pulse", className)} />
      )}
    </div>
  );
};
