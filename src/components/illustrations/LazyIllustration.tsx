import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Shimmer } from "@/components/ui/shimmer";

interface LazyIllustrationProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  animate?: boolean;
}

export const LazyIllustration = ({ 
  src, 
  alt, 
  className, 
  fallback,
  animate = true 
}: LazyIllustrationProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      {
        rootMargin: "50px",
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setError(true);
    console.error(`Failed to load illustration: ${src}`);
  };

  if (error && fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {!isLoaded && <Shimmer className="absolute inset-0" />}
      
      {isInView && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-500",
            isLoaded ? "opacity-100" : "opacity-0",
            animate && isLoaded && "animate-fade-in-up"
          )}
          loading="lazy"
        />
      )}
    </div>
  );
};
