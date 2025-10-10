import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Heart, MapPin, Bed, Bath, Maximize, Clock, Lock, Wrench, ExternalLink } from 'lucide-react';
import { Property } from '@/types';
import { getPropertyStatusLabel, formatPrice } from '@/constants';
import { supabase } from '@/integrations/supabase/client';
import ANSUTCertifiedBadge from '@/components/ui/ansut-certified-badge';
import { useTimeAgo } from '@/hooks/useTimeAgo';
import { toast } from '@/hooks/use-toast';
import { OptimizedImage } from '@/components/property/OptimizedImage';
import { useLongPress } from '@/hooks/useLongPress';
import { triggerHapticFeedback } from '@/utils/haptics';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

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
  const [showPreview, setShowPreview] = useState(false);
  const timeAgo = useTimeAgo(property.created_at);
  const { effectiveType, saveData } = useNetworkStatus();

  // Adapt image quality based on network
  const imageQuality = effectiveType === '4g' && !saveData;

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

  // Long press for preview
  const longPressProps = useLongPress({
    onLongPress: () => {
      setShowPreview(true);
      triggerHapticFeedback('heavy');
    },
    onClick: () => {}, // Empty, we use Link for navigation
    delay: 500,
  });

  // Swipe to favorite/unfavorite
  const swipeHandlers = useSwipeable({
    onSwipedRight: () => {
      if (!isFavorite && onFavoriteClick) {
        triggerHapticFeedback('heavy');
        onFavoriteClick(property.id);
        toast({
          title: "💙 Ajouté aux favoris !",
          description: "Glissez vers la gauche pour retirer",
          duration: 2000,
        });
      }
    },
    onSwipedLeft: () => {
      if (isFavorite && onFavoriteClick) {
        triggerHapticFeedback('medium');
        onFavoriteClick(property.id);
        toast({
          description: "❤️ Retiré des favoris",
          duration: 2000,
        });
      }
    },
    trackMouse: false,
    delta: 100,
  });

  return (
    <>
      <Card 
        {...swipeHandlers}
        {...longPressProps}
        className="group relative overflow-hidden bg-white shadow-card hover:shadow-card-hover transition-all duration-300 border border-border rounded-2xl animate-scale-in active:scale-95"
      >
      <div className="relative h-56 bg-muted overflow-hidden">
        {property.main_image ? (
          <>
            <OptimizedImage
              src={property.main_image}
              alt={`Photo du bien: ${property.title} - ${property.property_type} à ${property.city}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              priority={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-muted to-muted/50">
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Pas d'image</p>
            </div>
          </div>
        )}
        
        {onFavoriteClick && (
          <motion.button
            className="absolute top-3 right-3 rounded-lg shadow-md"
            whileTap={{ scale: 1.2 }}
            animate={isFavorite ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              triggerHapticFeedback('heavy');
              onFavoriteClick(property.id);
              toast({
                description: isFavorite ? "❤️ Bien retiré des favoris" : "💙 Bien ajouté aux favoris !",
                duration: 2000,
              });
            }}
          >
            <Button
              size="icon"
              variant={showRemoveButton ? "destructive" : isFavorite ? "default" : "secondary"}
              className="pointer-events-none"
              asChild
            >
              <motion.div
                animate={{
                  rotate: isFavorite ? [0, -15, 15, -15, 0] : 0,
                }}
                transition={{ duration: 0.5 }}
              >
                <Heart className={`h-4 w-4 transition-all duration-300 ${isFavorite ? 'fill-current' : ''}`} />
              </motion.div>
            </Button>
          </motion.button>
        )}
        
        {/* Time badge - top left */}
        <Badge className="absolute top-3 left-3 rounded-lg font-semibold shadow-md bg-background/90 backdrop-blur-sm text-foreground border border-border/50 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {timeAgo}
        </Badge>
        
        <div className="absolute top-14 left-3 flex flex-col gap-2">
          {showStatus && (
            <Badge className={`rounded-lg font-semibold shadow-md flex items-center gap-1 ${
              property.status === 'disponible' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-gray-500 text-white'
            }`}>
              {property.status === 'loué' && <Lock className="h-3 w-3" />}
              {getPropertyStatusLabel(property.status)}
            </Badge>
          )}
          
          {property.work_status && property.work_status !== 'aucun_travail' && (
            <Badge className="rounded-lg font-semibold shadow-md bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-1">
              <Wrench className="h-3 w-3" />
              Travaux
            </Badge>
          )}
        </div>
        
        {hasCertifiedLease && (
          <div className="absolute bottom-3 left-3">
            <ANSUTCertifiedBadge status="certified" variant="compact" />
          </div>
        )}
      </div>

      <CardHeader className="p-4 sm:p-6 pb-3">
        <CardTitle className="line-clamp-2 text-lg sm:text-xl">{property.title}</CardTitle>
        <p className="text-2xl sm:text-3xl font-bold text-primary mt-2">
          {formatPrice(property.monthly_rent)} <span className="text-base font-normal">/mois</span>
        </p>
      </CardHeader>

      <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
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

        <Button asChild className="w-full rounded-xl h-11 font-semibold shadow-md active:scale-95">
          <Link to={`/property/${property.id}`}>Voir les détails</Link>
        </Button>
      </CardContent>
    </Card>

    {/* Preview Modal */}
    <Dialog open={showPreview} onOpenChange={setShowPreview}>
      <DialogContent className="max-w-md">
        {property.main_image && (
          <OptimizedImage
            src={property.main_image}
            alt={property.title}
            className="w-full rounded-lg"
            priority={false}
          />
        )}
        <h3 className="text-xl font-bold">{property.title}</h3>
        <p className="text-2xl text-primary font-bold">
          {formatPrice(property.monthly_rent)} <span className="text-base font-normal">/mois</span>
        </p>
        <div className="flex items-center text-muted-foreground mb-2">
          <MapPin className="h-4 w-4 mr-2" />
          {property.city}
        </div>
        <div className="flex gap-2">
          {onFavoriteClick && (
            <Button
              variant={isFavorite ? "default" : "outline"}
              onClick={() => {
                triggerHapticFeedback('light');
                onFavoriteClick(property.id);
                toast({
                  description: isFavorite ? "❤️ Retiré des favoris" : "💙 Ajouté aux favoris",
                  duration: 2000,
                });
              }}
              className="flex-1"
            >
              <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
              Favoris
            </Button>
          )}
          <Button asChild className="flex-1">
            <Link to={`/property/${property.id}`}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Voir
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </>
  );
};
