import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyFiltersComponent, { PropertyFilters } from '@/components/PropertyFilters';
import PropertyMap from '@/components/PropertyMap';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Grid, List, Map } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { propertyService } from '@/services/propertyService';
import { usePropertyFilters } from '@/hooks/usePropertyFilters';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { RecommendationsSection } from '@/components/recommendations/RecommendationsSection';
import { Property } from '@/types';

type ViewMode = 'grid' | 'list' | 'map';

const Search = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  const { filteredProperties, handleFilterChange, handleLocationSearch, handleReset } = 
    usePropertyFilters(properties);

  useEffect(() => {
    fetchProperties();
  }, []);

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

  const fetchProperties = async () => {
    try {
      const data = await propertyService.fetchAll();
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 pt-24">
        <div className="max-w-7xl mx-auto">
          {user && (
            <div className="mb-8">
              <RecommendationsSection userId={user.id} type="properties" limit={5} />
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

          <PropertyFiltersComponent onFilterChange={handleFilterChange as any} onReset={handleReset} />

          {viewMode === 'map' ? (
            <div className="mt-6 h-[600px] rounded-lg overflow-hidden border">
              <PropertyMap 
                properties={filteredProperties}
                onPropertyClick={(id) => navigate(`/property/${id}`)}
                onLocationSearch={(lat, lng) => handleLocationSearch(5)}
                showLocationButton={true}
              />
            </div>
          ) : (
            <>
              {filteredProperties.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">Aucun bien ne correspond à vos critères</p>
                </Card>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6' : 'space-y-4 mt-6'}>
                  {filteredProperties.map(property => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      onFavoriteClick={toggleFavorite}
                      isFavorite={isFavorite(property.id)}
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
