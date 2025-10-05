import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Navigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { DynamicBreadcrumb } from '@/components/navigation/DynamicBreadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MapPin, BedDouble, Bath, Square, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { logger } from '@/services/logger';
import type { Property as PropertyType, STATUS_LABELS, STATUS_COLORS } from '@/types';
import { STATUS_LABELS as statusLabels, STATUS_COLORS as statusColors } from '@/types';

// Use centralized Property type from types/index.ts
type Property = Pick<PropertyType, 
  'id' | 'title' | 'description' | 'property_type' | 'status' | 
  'address' | 'city' | 'bedrooms' | 'bathrooms' | 'surface_area' | 
  'monthly_rent' | 'main_image' | 'view_count' | 'created_at'
> & {
  moderation_status?: string;
  moderation_notes?: string;
};

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
      logger.error('Failed to fetch user properties', { error, userId: user?.id });
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 pt-24">
        <div className="max-w-7xl mx-auto space-y-8">
          <DynamicBreadcrumb />
          
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold">Mes Biens Immobiliers</h1>
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
                <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Moderation Status Alert */}
                  {property.moderation_status === 'pending' && (
                    <Alert className="m-4 mb-0">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Cette annonce est en attente de modération par un administrateur.
                      </AlertDescription>
                    </Alert>
                  )}
                  {property.moderation_status === 'rejected' && (
                    <Alert variant="destructive" className="m-4 mb-0">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Cette annonce a été rejetée. Raison: {property.moderation_notes || 'Non spécifiée'}
                      </AlertDescription>
                    </Alert>
                  )}
                  {property.moderation_status === 'changes_requested' && (
                    <Alert className="m-4 mb-0">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Modifications demandées: {property.moderation_notes || 'Non spécifiée'}
                      </AlertDescription>
                    </Alert>
                  )}

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
