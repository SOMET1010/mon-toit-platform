import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Navigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MapPin, BedDouble, Bath, Square, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Property {
  id: string;
  title: string;
  description: string;
  property_type: string;
  status: string;
  address: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  surface_area: number;
  monthly_rent: number;
  main_image: string | null;
  view_count: number;
  created_at: string;
}

const MyProperties = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProperties();
    }
  }, [user]);

  const fetchProperties = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('owner_id', user!.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching properties:', error);
    } else {
      setProperties(data || []);
    }
    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || (profile && profile.user_type === 'locataire')) {
    return <Navigate to="/" replace />;
  }

  const statusLabels: Record<string, string> = {
    disponible: 'Disponible',
    loue: 'Loué',
    en_attente: 'En attente',
    retire: 'Retiré',
  };

  const statusColors: Record<string, string> = {
    disponible: 'bg-green-500',
    loue: 'bg-blue-500',
    en_attente: 'bg-yellow-500',
    retire: 'bg-gray-500',
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 pt-24">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">Mes Biens Immobiliers</h1>
              <p className="text-muted-foreground mt-2">
                {properties.length} {properties.length > 1 ? 'biens' : 'bien'} au total
              </p>
            </div>
            <Button asChild>
              <Link to="/ajouter-bien">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un bien
              </Link>
            </Button>
          </div>

          {/* Properties Grid */}
          {properties.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="space-y-4">
                <p className="text-muted-foreground">Vous n'avez pas encore ajouté de biens</p>
                <Button asChild>
                  <Link to="/ajouter-bien">
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter mon premier bien
                  </Link>
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Card key={property.id} className="overflow-hidden border-2 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 rounded-xl">
                  {/* Property Image */}
                  <div className="aspect-video bg-muted relative">
                    {property.main_image ? (
                      <img
                        src={property.main_image}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MapPin className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <Badge className={`absolute top-2 right-2 ${statusColors[property.status]}`}>
                      {statusLabels[property.status]}
                    </Badge>
                  </div>

                  <CardHeader>
                    <CardTitle className="line-clamp-1">{property.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {property.city}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Property Details */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <BedDouble className="h-4 w-4" />
                        {property.bedrooms}
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="h-4 w-4" />
                        {property.bathrooms}
                      </div>
                      <div className="flex items-center gap-1">
                        <Square className="h-4 w-4" />
                        {property.surface_area}m²
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-2xl font-bold text-primary">
                      {property.monthly_rent.toLocaleString()} FCFA/mois
                    </div>

                    {/* Views */}
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      {property.view_count} vues
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" asChild>
                        <Link to={`/biens/${property.id}`}>Voir</Link>
                      </Button>
                      <Button variant="outline" className="flex-1" asChild>
                        <Link to={`/biens/${property.id}/modifier`}>Modifier</Link>
                      </Button>
                    </div>
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

export default MyProperties;
