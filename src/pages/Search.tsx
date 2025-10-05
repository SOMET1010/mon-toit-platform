import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyFiltersComponent, { PropertyFilters } from '@/components/PropertyFilters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Bed, Bath, Maximize, Grid, List, Map, Search as SearchIcon } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { Link } from 'react-router-dom';

type ViewMode = 'grid' | 'list' | 'map';

interface Property {
  id: string;
  title: string;
  description: string | null;
  property_type: string;
  city: string;
  neighborhood: string | null;
  monthly_rent: number;
  surface_area: number | null;
  bedrooms: number;
  bathrooms: number;
  is_furnished: boolean;
  has_ac: boolean;
  has_parking: boolean;
  has_garden: boolean;
  main_image: string | null;
  status: string;
}

const Search = () => {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    // Apply filters from URL parameters
    if (properties.length > 0) {
      const location = searchParams.get('location');
      const type = searchParams.get('type');
      const maxPrice = searchParams.get('maxPrice');

      if (location || type || maxPrice) {
        const filters: PropertyFilters = {};
        
        if (location) {
          // Try to match city or neighborhood
          filters.city = location;
        }
        
        if (type) {
          filters.propertyType = type;
        }
        
        if (maxPrice) {
          filters.maxPrice = parseInt(maxPrice);
        }

        handleFilterChange(filters);
      }
    }
  }, [properties, searchParams]);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
      setFilteredProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters: PropertyFilters) => {
    let filtered = [...properties];

    if (filters.city) {
      filtered = filtered.filter(p => p.city === filters.city);
    }
    if (filters.propertyType) {
      filtered = filtered.filter(p => p.property_type === filters.propertyType);
    }
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(p => p.monthly_rent >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(p => p.monthly_rent <= filters.maxPrice!);
    }
    if (filters.minSurface !== undefined) {
      filtered = filtered.filter(p => (p.surface_area || 0) >= filters.minSurface!);
    }
    if (filters.maxSurface !== undefined) {
      filtered = filtered.filter(p => (p.surface_area || 0) <= filters.maxSurface!);
    }
    if (filters.bedrooms !== undefined) {
      filtered = filtered.filter(p => p.bedrooms >= filters.bedrooms!);
    }
    if (filters.bathrooms !== undefined) {
      filtered = filtered.filter(p => p.bathrooms >= filters.bathrooms!);
    }
    if (filters.isFurnished) {
      filtered = filtered.filter(p => p.is_furnished);
    }
    if (filters.hasAc) {
      filtered = filtered.filter(p => p.has_ac);
    }
    if (filters.hasParking) {
      filtered = filtered.filter(p => p.has_parking);
    }
    if (filters.hasGarden) {
      filtered = filtered.filter(p => p.has_garden);
    }
    if (filters.status) {
      filtered = filtered.filter(p => p.status === filters.status);
    }

    setFilteredProperties(filtered);
  };

  const handleReset = () => {
    setFilteredProperties(properties);
  };

  const PropertyCard = ({ property }: { property: Property }) => {
    const favorite = isFavorite(property.id);

    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative h-48 bg-muted">
          {property.main_image ? (
            <img
              src={property.main_image}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              Pas d'image
            </div>
          )}
          <Button
            size="icon"
            variant="secondary"
            className="absolute top-2 right-2"
            onClick={() => toggleFavorite(property.id)}
          >
            <Heart className={`h-4 w-4 ${favorite ? 'fill-current text-destructive' : ''}`} />
          </Button>
          <Badge className="absolute top-2 left-2">
            {property.status === 'disponible' ? 'Disponible' : 'Loué'}
          </Badge>
        </div>
        <CardHeader>
          <CardTitle className="line-clamp-1">{property.title}</CardTitle>
          <p className="text-2xl font-bold text-primary">
            {property.monthly_rent.toLocaleString()} FCFA/mois
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center text-muted-foreground text-sm">
            <MapPin className="h-4 w-4 mr-1" />
            {property.city}{property.neighborhood ? `, ${property.neighborhood}` : ''}
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              {property.bedrooms} ch.
            </div>
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              {property.bathrooms} sdb.
            </div>
            {property.surface_area && (
              <div className="flex items-center">
                <Maximize className="h-4 w-4 mr-1" />
                {property.surface_area} m²
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {property.is_furnished && <Badge variant="secondary">Meublé</Badge>}
            {property.has_ac && <Badge variant="secondary">Climatisation</Badge>}
            {property.has_parking && <Badge variant="secondary">Parking</Badge>}
            {property.has_garden && <Badge variant="secondary">Jardin</Badge>}
          </div>
          <Button asChild className="w-full">
            <Link to={`/property/${property.id}`}>Voir les détails</Link>
          </Button>
        </CardContent>
      </Card>
    );
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
                disabled
              >
                <Map className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <PropertyFiltersComponent onFilterChange={handleFilterChange} onReset={handleReset} />

          {filteredProperties.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Aucun bien ne correspond à vos critères</p>
            </Card>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Search;
