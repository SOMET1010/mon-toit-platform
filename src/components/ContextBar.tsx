import { memo } from 'react';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useWeather } from '@/hooks/useWeather';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LocationWidget } from './context-bar/LocationWidget';
import { WeatherWidget } from './context-bar/WeatherWidget';
import { ClockWidget } from './context-bar/ClockWidget';
import { toast } from 'sonner';

const ContextBar = memo(() => {
  const { formatTime, formatDate, dayPeriod } = useCurrentTime();
  const { location, isLoading: locationLoading, error: locationError, refresh: refreshLocation } = useGeolocation();
  const { weather, isLoading: weatherLoading, error: weatherError, refresh: refreshWeather } = useWeather();

  const handleLocationRefresh = async () => {
    await refreshLocation();
    toast.success('Localisation actualisée');
  };

  const handleWeatherRefresh = async () => {
    await refreshWeather();
    toast.success('Météo actualisée');
  };

  return (
    <div 
      className="w-full bg-gradient-to-r from-primary/5 via-accent/10 to-primary/5 border-b border-border/50 backdrop-blur-md sticky top-16 z-40"
      role="banner"
      aria-label="Barre d'informations contextuelles"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <TooltipProvider delayDuration={300}>
          <div className="h-10 flex items-center justify-center gap-4 md:gap-6 text-sm">
            
            <LocationWidget
              location={location}
              isLoading={locationLoading}
              error={locationError}
              onRefresh={handleLocationRefresh}
            />

            <span className="text-border/40" aria-hidden="true">•</span>

            <WeatherWidget
              weather={weather}
              isLoading={weatherLoading}
              error={weatherError}
              onRefresh={handleWeatherRefresh}
            />

            <span className="text-border/40 hidden md:inline" aria-hidden="true">•</span>

            <div className="hidden md:block">
              <ClockWidget
                formatTime={formatTime}
                formatDate={formatDate}
                dayPeriod={dayPeriod}
              />
            </div>
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
});

ContextBar.displayName = 'ContextBar';

export default ContextBar;
