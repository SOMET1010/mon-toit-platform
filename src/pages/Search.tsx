import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyFiltersComponent, { PropertyFilters } from '@/components/PropertyFilters';
import MobileFilters from '@/components/properties/MobileFilters';
import { PullToRefresh } from '@/components/properties/PullToRefresh';
import PropertyMap from '@/components/PropertyMap';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Grid, List, Map, Search as SearchIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { useProperties } from '@/hooks/useProperties';
import { usePropertyFilters } from '@/hooks/usePropertyFilters';
import { useIsMobile } from '@/hooks/use-mobile';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { PropertyCardSkeleton } from '@/components/properties/PropertyCardSkeleton';
import { RecommendationsSection } from '@/components/recommendations/RecommendationsSection';
import { hasCoordinates } from '@/lib/geo';
import { toast } from 'sonner';

type ViewMode = 'grid' | 'list' | 'map';

const Search = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { data: properties = [], isLoading, refetch } = useProperties();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const isMobile = useIsMobile();
  
  const { filteredProperties, handleFilterChange, handleLocationSearch, handleReset } = 
    usePropertyFilters(properties);

  useEffect(() => {
    if (properties.length > 0) {
      const location = searchParams.get('location');
      const type = searchParams.get('type');
      const maxPrice = searchParams.get('maxPrice');

      if (location || type || maxPrice) {
        const filters: PropertyFilters = {};
        if (location) filters.city = location;
        if (type) filters.propertyType = type;
        if (maxPrice) filters.maxPrice = parseInt(maxPrice);
        handleFilterChange(filters as any);
      }
    }
  }, [properties, searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 pt-24">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Recherche de biens</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleFavoriteClick = (propertyId: string) => {
    if (!user) {
      toast.error("Connectez-vous pour ajouter des favoris");
      return;
    }
    toggleFavorite(propertyId);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 pt-24">
        <div className="max-w-7xl mx-auto">
          {!user && (
            <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 mb-6">
              <p className="text-center text-sm">
                💡 <Link to="/auth" className="text-primary hover:underline font-medium">Créez un compte</Link> pour postuler et accéder à toutes les fonctionnalités
              </p>
            </div>
          )}
          
          {user && properties.length > 0 && !isLoading && (
            <div className="mb-8">
              <RecommendationsSection 
                userId={user.id} 
                type="properties" 
                limit={5}
              />
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Recherche de biens</h1>
              <p className="text-muted-foreground mt-1">
                {filteredProperties.length} bien{filteredProperties.length > 1 ? 's' : ''} trouvé{filteredProperties.length > 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('map')}
              >
                <Map className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isMobile ? (
            <MobileFilters 
              onFilterChange={handleFilterChange as any} 
              onReset={handleReset}
            />
          ) : (
            <PropertyFiltersComponent onFilterChange={handleFilterChange as any} onReset={handleReset} />
          )}

          {viewMode === 'map' ? (
            <div className="mt-6 h-[600px] rounded-lg overflow-hidden border">
              <PropertyMap 
                properties={filteredProperties.filter(hasCoordinates)}
                onPropertyClick={(id) => navigate(`/property/${id}`)}
                onLocationSearch={(lat, lng) => handleLocationSearch(5)}
                showLocationButton={true}
              />
            </div>
          ) : (
            <>
              {filteredProperties.length === 0 ? (
                <Card className="p-12 text-center border-2 border-dashed border-muted-foreground/20">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                      <SearchIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Aucun résultat trouvé</h3>
                      <p className="text-muted-foreground mb-4">
                        Essayez d'ajuster vos filtres ou de rechercher dans une autre ville
                      </p>
                      <Button variant="outline" onClick={handleReset}>
                        Réinitialiser les filtres
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : isMobile ? (
                <PullToRefresh onRefresh={async () => { await refetch(); }}>
                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6' : 'space-y-4 mt-6'}>
                    {filteredProperties.map(property => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        onFavoriteClick={handleFavoriteClick}
                        isFavorite={user ? isFavorite(property.id) : false}
                      />
                    ))}
                  </div>
                </PullToRefresh>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6' : 'space-y-4 mt-6'}>
                  {filteredProperties.map(property => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      onFavoriteClick={handleFavoriteClick}
                      isFavorite={user ? isFavorite(property.id) : false}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Search;
