import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Bed, Bath, Maximize, Trash2 } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

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

const Favorites = () => {
  const { user } = useAuth();
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
      console.error('Error fetching favorite properties:', error);
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 pt-24">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Mes Favoris</h1>
            <p className="text-muted-foreground mt-2">
              {properties.length} bien{properties.length > 1 ? 's' : ''} sauvegardé{properties.length > 1 ? 's' : ''}
            </p>
          </div>

          {properties.length === 0 ? (
            <Card className="p-12 text-center">
              <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aucun favori</h3>
              <p className="text-muted-foreground mb-4">
                Vous n'avez pas encore ajouté de biens à vos favoris
              </p>
              <Button asChild>
                <Link to="/recherche">Parcourir les biens</Link>
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map(property => (
                <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={() => toggleFavorite(property.id)}
                    >
                      <Trash2 className="h-4 w-4" />
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
