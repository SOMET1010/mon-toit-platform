import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { ILLUSTRATIONS } from '@/lib/illustrations';
import { EmptyState } from '@/components/ui/empty-state';
import { useFavorites } from '@/hooks/useFavorites';
import { Link } from 'react-router-dom';
import { DynamicBreadcrumb } from '@/components/navigation/DynamicBreadcrumb';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { Property } from '@/types';
import { logger } from '@/services/logger';

const Favorites = () => {
  const { favorites, toggleFavorite, loading: favoritesLoading } = useFavorites();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (favorites.length > 0) {
      fetchFavoriteProperties();
    } else {
      setProperties([]);
      setLoading(false);
    }
  }, [favorites]);

  const fetchFavoriteProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .in('id', favorites);

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      logger.logError(error, { context: 'Favorites', action: 'fetchFavoriteProperties' });
    } finally {
      setLoading(false);
    }
  };

  if (loading || favoritesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6 pt-24">
        <div className="max-w-7xl mx-auto">
          <DynamicBreadcrumb />
          <div className="mb-10">
            <h1 className="text-4xl font-bold mb-3 flex items-center gap-3">
              <Heart className="h-8 w-8 text-primary fill-primary" />
              Mes Favoris
            </h1>
            <p className="text-lg text-muted-foreground">
              {properties.length} bien{properties.length > 1 ? 's' : ''} sauvegardé{properties.length > 1 ? 's' : ''}
            </p>
          </div>

          {properties.length === 0 ? (
            <Card className="border-2 shadow-xl bg-gradient-to-br from-background to-muted/20">
              <EmptyState
                illustration={ILLUSTRATIONS.emptyStates.noFavorites}
                title="Aucun favori pour le moment"
                description="Commencez à explorer nos biens et ajoutez vos coups de cœur à vos favoris"
                action={{
                  label: "🏠 Parcourir les biens",
                  onClick: () => window.location.href = '/recherche'
                }}
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map(property => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onFavoriteClick={() => toggleFavorite(property.id)}
                  isFavorite={true}
                  showRemoveButton
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Favorites;
