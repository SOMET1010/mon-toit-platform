import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Heart, MapPin, Bed, Bath, Maximize, Home, CheckCircle2, 
  ArrowLeft, MessageCircle, Calendar, DollarSign 
} from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Property {
  id: string;
  title: string;
  description: string | null;
  property_type: string;
  city: string;
  neighborhood: string | null;
  address: string;
  monthly_rent: number;
  deposit_amount: number | null;
  charges_amount: number | null;
  surface_area: number | null;
  bedrooms: number;
  bathrooms: number;
  floor_number: number | null;
  is_furnished: boolean;
  has_ac: boolean;
  has_parking: boolean;
  has_garden: boolean;
  main_image: string | null;
  images: string[] | null;
  status: string;
  created_at: string;
  owner_id: string;
}

interface PropertyOwner {
  id: string;
  full_name: string;
  user_type: string;
  phone: string | null;
}

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [property, setProperty] = useState<Property | null>(null);
  const [owner, setOwner] = useState<PropertyOwner | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchPropertyDetails();
    }
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (propertyError) throw propertyError;
      setProperty(propertyData);
      setSelectedImage(propertyData.main_image);

      // Fetch owner details
      const { data: ownerData, error: ownerError } = await supabase
        .from('profiles')
        .select('id, full_name, user_type, phone')
        .eq('id', propertyData.owner_id)
        .single();

      if (ownerError) throw ownerError;
      setOwner(ownerData);
    } catch (error) {
      console.error('Error fetching property:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails du bien",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContact = () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour contacter le propriétaire",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    // Navigate to messaging with owner
    navigate(`/messages?recipient=${property?.owner_id}`);
  };

  const handleApply = () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour postuler",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    navigate(`/application/${property?.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold mb-4">Bien introuvable</h1>
          <Button asChild>
            <Link to="/recherche">Retour à la recherche</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const allImages = [
    property.main_image,
    ...(property.images || [])
  ].filter(Boolean) as string[];

  const favorite = isFavorite(property.id);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 pt-24">
        <div className="max-w-7xl mx-auto">
          {/* Back button */}
          <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Images and main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Main image */}
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    Pas d'image disponible
                  </div>
                )}
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute top-4 right-4"
                  onClick={() => toggleFavorite(property.id)}
                >
                  <Heart className={`h-5 w-5 ${favorite ? 'fill-current text-destructive' : ''}`} />
                </Button>
                <Badge className="absolute top-4 left-4">
                  {property.status === 'disponible' ? 'Disponible' : 'Loué'}
                </Badge>
              </div>

              {/* Image gallery */}
              {allImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`aspect-video bg-muted rounded overflow-hidden border-2 transition-all ${
                        selectedImage === img ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {property.description || 'Aucune description disponible.'}
                  </p>
                </CardContent>
              </Card>

              {/* Characteristics */}
              <Card>
                <CardHeader>
                  <CardTitle>Caractéristiques</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Home className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Type</p>
                        <p className="font-medium">{property.property_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Maximize className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Surface</p>
                        <p className="font-medium">{property.surface_area || 'N/A'} m²</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bed className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Chambres</p>
                        <p className="font-medium">{property.bedrooms}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bath className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Salles de bain</p>
                        <p className="font-medium">{property.bathrooms}</p>
                      </div>
                    </div>
                    {property.floor_number && (
                      <div className="flex items-center gap-2">
                        <Home className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Étage</p>
                          <p className="font-medium">{property.floor_number}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator className="my-4" />

                  <div className="flex flex-wrap gap-2">
                    {property.is_furnished && (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Meublé
                      </Badge>
                    )}
                    {property.has_ac && (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Climatisation
                      </Badge>
                    )}
                    {property.has_parking && (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Parking
                      </Badge>
                    )}
                    {property.has_garden && (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Jardin
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle>Localisation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">{property.city}</p>
                      {property.neighborhood && (
                        <p className="text-sm text-muted-foreground">{property.neighborhood}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">{property.address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price card */}
              <Card>
                <CardHeader>
                  <h1 className="text-3xl font-bold">{property.title}</h1>
                  <p className="text-3xl font-bold text-primary mt-2">
                    {property.monthly_rent.toLocaleString()} FCFA
                    <span className="text-sm text-muted-foreground font-normal">/mois</span>
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {property.deposit_amount && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Caution</span>
                      <span className="font-medium">{property.deposit_amount.toLocaleString()} FCFA</span>
                    </div>
                  )}
                  {property.charges_amount && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Charges</span>
                      <span className="font-medium">{property.charges_amount.toLocaleString()} FCFA</span>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-2">
                    <Button className="w-full gap-2" onClick={handleContact}>
                      <MessageCircle className="h-4 w-4" />
                      Contacter le propriétaire
                    </Button>
                  {user && property.status === 'disponible' && property.owner_id !== user.id && (
                    <Button variant="outline" className="w-full gap-2" onClick={handleApply}>
                      <Calendar className="h-4 w-4" />
                      Postuler
                    </Button>
                  )}
                  </div>
                </CardContent>
              </Card>

              {/* Owner card */}
              {owner && (
                <Card>
                  <CardHeader>
                    <CardTitle>Propriétaire</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {owner.full_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{owner.full_name}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {owner.user_type}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Info card */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Publié le {new Date(property.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PropertyDetail;
