import { memo } from 'react';
import { MapPin, RefreshCw } from 'lucide-react';
import { Widget } from './Widget';
import type { GeolocationData } from './types';

interface LocationWidgetProps {
  location: GeolocationData;
  isLoading: boolean;
  error: Error | null;
  onRefresh: () => void;
}

export const LocationWidget = memo(({ 
  location, 
  isLoading, 
  error,
  onRefresh 
}: LocationWidgetProps) => {
  const tooltip = (
    <div className="space-y-1">
      <p className="font-semibold">{location.city}</p>
      {location.neighborhood && (
        <p className="text-xs text-muted-foreground">Quartier: {location.neighborhood}</p>
      )}
      {location.country && (
        <p className="text-xs text-muted-foreground">{location.country}</p>
      )}
      {location.latitude && location.longitude && (
        <p className="text-xs text-muted-foreground">
          GPS: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
        </p>
      )}
      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
        <RefreshCw className="h-3 w-3" />
        Cliquer pour actualiser
      </p>
    </div>
  );

  return (
    <Widget
      isLoading={isLoading}
      hasError={!!error}
      onClick={onRefresh}
      ariaLabel="Localisation actuelle - Cliquer pour rafraîchir"
      tooltip={tooltip}
    >
      <MapPin className="h-4 w-4 text-primary group-hover:animate-pulse" />
      <span className="font-semibold text-sm">{location.city}</span>
      {location.neighborhood && (
        <span className="text-xs text-muted-foreground hidden lg:inline">
          • {location.neighborhood}
        </span>
      )}
    </Widget>
  );
});

LocationWidget.displayName = 'LocationWidget';
