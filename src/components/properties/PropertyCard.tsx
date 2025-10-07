import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Bed, Bath, Maximize, Clock, Lock } from 'lucide-react';
import { Property } from '@/types';
import { getPropertyStatusLabel, formatPrice } from '@/constants';
import { supabase } from '@/integrations/supabase/client';
import ANSUTCertifiedBadge from '@/components/ui/ansut-certified-badge';
import { useTimeAgo } from '@/hooks/useTimeAgo';
import { toast } from '@/hooks/use-toast';

interface PropertyCardProps {
  property: Property;
  onFavoriteClick?: (id: string) => void;
  isFavorite?: boolean;
  variant?: 'default' | 'compact';
  showStatus?: boolean;
  showRemoveButton?: boolean;
}

export const PropertyCard = ({ 
  property, 
  onFavoriteClick,
  isFavorite = false,
  variant = 'default',
  showStatus = true,
  showRemoveButton = false
}: PropertyCardProps) => {
  const [hasCertifiedLease, setHasCertifiedLease] = useState(false);
  const timeAgo = useTimeAgo(property.created_at);

  useEffect(() => {
    const checkCertification = async () => {
      const { data } = await supabase
        .from('leases')
        .select('id')
        .eq('property_id', property.id)
        .eq('certification_status', 'certified')
        .limit(1)
        .maybeSingle();
      
      setHasCertifiedLease(!!data);
    };

    checkCertification();
  }, [property.id]);

  return (
    <Card className="group relative overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200">
      <div className="relative h-56 bg-muted overflow-hidden">
        {property.main_image ? (
          <img
            src={property.main_image}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-muted to-muted/50">
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Pas d'image</p>
            </div>
          </div>
        )}
        
        {onFavoriteClick && (
          <Button
            size="icon"
            variant={showRemoveButton ? "destructive" : isFavorite ? "default" : "secondary"}
            className="absolute top-3 right-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
            onClick={() => {
              onFavoriteClick(property.id);
              toast({
                description: isFavorite ? "Bien retiré des favoris" : "Bien ajouté aux favoris !",
              });
            }}
          >
            <Heart className={`h-4 w-4 transition-all ${isFavorite ? 'fill-current scale-110' : ''}`} />
          </Button>
        )}
        
        {/* Time badge - top left */}
        <Badge className="absolute top-3 left-3 rounded-lg font-semibold shadow-md bg-background/90 backdrop-blur-sm text-foreground border border-border/50 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {timeAgo}
        </Badge>
        
        {showStatus && (
          <Badge className={`absolute top-14 left-3 rounded-lg font-semibold shadow-md flex items-center gap-1 ${
            property.status === 'disponible' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-gray-500 text-white'
          }`}>
            {property.status === 'loué' && <Lock className="h-3 w-3" />}
            {getPropertyStatusLabel(property.status)}
          </Badge>
        )}
        
        {hasCertifiedLease && (
          <div className="absolute bottom-3 left-3">
            <ANSUTCertifiedBadge status="certified" variant="compact" />
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="line-clamp-2 text-lg">{property.title}</CardTitle>
        <p className="text-2xl font-bold text-primary mt-2">
          {formatPrice(property.monthly_rent)} <span className="text-base font-normal">/mois</span>
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center text-muted-foreground">
          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="line-clamp-1">{property.city}</span>
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

        {variant === 'default' && (
          <div className="flex flex-wrap gap-2">
            {property.is_furnished && <Badge variant="secondary" className="rounded-full">Meublé</Badge>}
            {property.has_ac && <Badge variant="secondary" className="rounded-full">Climatisation</Badge>}
            {property.has_parking && <Badge variant="secondary" className="rounded-full">Parking</Badge>}
            {property.has_garden && <Badge variant="secondary" className="rounded-full">Jardin</Badge>}
          </div>
        )}

        <Button asChild className="w-full rounded-xl h-11 font-semibold shadow-md">
          <Link to={`/property/${property.id}`}>Voir les détails</Link>
        </Button>
      </CardContent>
    </Card>
  );
};
