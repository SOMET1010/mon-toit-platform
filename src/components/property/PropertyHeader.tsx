import { Heart, MapPin, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Property } from '@/types';
import { StatusBadge } from '@/components/properties/StatusBadge';
import { formatPrice } from '@/lib/badgeHelpers';

interface PropertyHeaderProps {
  property: Property;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
}

export const PropertyHeader = ({ property, isFavorite, onFavoriteToggle }: PropertyHeaderProps) => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: property.description || '',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
      <div className="flex-1">
        <div className="flex items-start gap-3 mb-3">
          <h1 className="text-3xl font-bold flex-1">{property.title}</h1>
          <StatusBadge status={property.status} />
        </div>
        
        <div className="flex items-center text-muted-foreground mb-4">
          <MapPin className="h-5 w-5 mr-2" />
          <span className="text-lg">
            {property.address}, {property.city}
            {property.neighborhood && ` - ${property.neighborhood}`}
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-primary">
            {formatPrice(property.monthly_rent)}
          </span>
          <span className="text-xl text-muted-foreground">/mois</span>
        </div>

        {property.deposit_amount && (
          <p className="text-muted-foreground mt-2">
            Caution: {formatPrice(property.deposit_amount)}
          </p>
        )}
        {property.charges_amount && (
          <p className="text-muted-foreground">
            Charges: {formatPrice(property.charges_amount)}/mois
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant={isFavorite ? "default" : "outline"}
          size="icon"
          onClick={onFavoriteToggle}
          className="rounded-full"
        >
          <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleShare}
          className="rounded-full"
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
