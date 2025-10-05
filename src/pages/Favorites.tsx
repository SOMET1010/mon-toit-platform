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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 pt-24">
        <div className="max-w-7xl mx-auto">
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
            <Card className="p-16 text-center border-2 shadow-xl bg-gradient-to-br from-background to-muted/20">
              <div className="p-6 rounded-full bg-primary/10 w-fit mx-auto mb-6">
                <Heart className="h-20 w-20 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Aucun favori pour le moment</h3>
              <p className="text-muted-foreground mb-6 text-lg max-w-md mx-auto">
                Commencez à explorer nos biens et ajoutez vos coups de cœur à vos favoris
              </p>
              <Button asChild size="lg" className="rounded-xl h-14 px-8 text-base font-semibold shadow-lg">
                <Link to="/recherche">🏠 Parcourir les biens</Link>
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map(property => (
                <Card key={property.id} className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2">
                  <div className="relative h-56 bg-muted">
                    {property.main_image ? (
                      <img
                        src={property.main_image}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-muted to-muted/50">
                        <div className="text-center">
                          <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Pas d'image</p>
                        </div>
                      </div>
                    )}
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-3 right-3 rounded-xl shadow-lg hover:scale-110 transition-transform"
                      onClick={() => toggleFavorite(property.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Badge className={`absolute top-3 left-3 rounded-xl font-semibold ${
                      property.status === 'disponible' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-500 text-white'
                    }`}>
                      {property.status === 'disponible' ? '✓ Disponible' : 'Loué'}
                    </Badge>
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="line-clamp-2 text-lg">{property.title}</CardTitle>
                    <p className="text-2xl font-bold text-primary mt-2">
                      {property.monthly_rent.toLocaleString()} <span className="text-base font-normal">FCFA/mois</span>
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="line-clamp-1">
                        {property.city}{property.neighborhood ? `, ${property.neighborhood}` : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm bg-muted/50 p-3 rounded-xl">
                      <div className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        <span className="font-medium">{property.bedrooms}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="h-4 w-4" />
                        <span className="font-medium">{property.bathrooms}</span>
                      </div>
                      {property.surface_area && (
                        <div className="flex items-center gap-1">
                          <Maximize className="h-4 w-4" />
                          <span className="font-medium">{property.surface_area}m²</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {property.is_furnished && <Badge variant="secondary" className="rounded-full">Meublé</Badge>}
                      {property.has_ac && <Badge variant="secondary" className="rounded-full">Climatisation</Badge>}
                      {property.has_parking && <Badge variant="secondary" className="rounded-full">Parking</Badge>}
                      {property.has_garden && <Badge variant="secondary" className="rounded-full">Jardin</Badge>}
                    </div>
                    <Button asChild className="w-full rounded-xl h-11 font-semibold shadow-md">
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
