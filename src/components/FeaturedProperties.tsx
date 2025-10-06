import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { propertyService } from '@/services/propertyService';
import { Property } from '@/types';
import { useFavorites } from '@/hooks/useFavorites';

const FeaturedProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  const fetchFeaturedProperties = async () => {
    try {
      const data = await propertyService.fetchAll();
      const featured = data
        .filter(p => p.status === 'disponible')
        .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
        .slice(0, 4);
      setProperties(featured);
    } catch (error) {
      console.error('Error fetching featured properties:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (properties.length === 0) return null;

  return (
    <section className="py-20 md:py-28 px-4 bg-white">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Biens en vedette</h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Découvrez notre sélection de biens les plus consultés
            </p>
          </div>
          <Button asChild variant="outline" className="mt-6 md:mt-0">
            <Link to="/recherche">Voir tous les biens</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onFavoriteClick={toggleFavorite}
              isFavorite={isFavorite(property.id)}
              variant="compact"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
