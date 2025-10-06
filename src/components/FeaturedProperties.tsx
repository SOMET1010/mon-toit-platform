import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { propertyService } from '@/services/propertyService';
import { Property } from '@/types';
import { useFavorites } from '@/hooks/useFavorites';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { handleError } from '@/lib/errorHandler';

const FeaturedProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();

  const fetchFeaturedProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await propertyService.fetchAll();
      
      const featured = data
        .filter(p => p.status === 'disponible')
        .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
        .slice(0, 4);
      
      setProperties(featured);
    } catch (err) {
      console.error('Error fetching featured properties:', err);
      const errorMessage = 'Impossible de charger les biens en vedette. Veuillez réessayer.';
      setError(errorMessage);
      handleError(err, errorMessage);
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
  }, []);

  useEffect(() => {
    fetchFeaturedProperties();
  }, [fetchFeaturedProperties]);

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    await fetchFeaturedProperties();
  }, [fetchFeaturedProperties]);

  // Skeleton loader optimisé pour PropertyCard
  const SkeletonCard = useMemo(() => (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md">
      <Skeleton className="h-56 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center gap-4 pt-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-8 w-full mt-4" />
      </div>
    </div>
  ), []);

  if (loading) {
    return (
      <section className="py-20 md:py-28 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Biens en vedette
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Découvrez notre sélection de biens les plus consultés
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>{SkeletonCard}</div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 md:py-28 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-foreground">
              Une erreur est survenue
            </h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              {error}
            </p>
            <Button onClick={handleRetry} variant="outline" disabled={isRetrying}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Chargement...' : 'Réessayer'}
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (properties.length === 0) {
    return null;
  }

  return (
    <section className="py-20 md:py-28 px-4 bg-white" aria-labelledby="featured-properties-heading">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <h2 
              id="featured-properties-heading"
              className="text-4xl md:text-5xl font-bold mb-4 text-foreground"
            >
              Biens en vedette
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Découvrez notre sélection de biens les plus consultés
            </p>
          </div>
          <Button asChild variant="outline" className="mt-6 md:mt-0">
            <Link to="/recherche">Voir tous les biens</Link>
          </Button>
        </div>
        
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          role="list"
          aria-label="Biens immobiliers en vedette"
        >
          {properties.map((property) => (
            <div key={property.id} role="listitem">
              <PropertyCard
                property={property}
                onFavoriteClick={toggleFavorite}
                isFavorite={isFavorite(property.id)}
                variant="compact"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
