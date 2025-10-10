import { MapPin, Cloud, CloudRain, CloudLightning, CloudSun, CloudMoon, Sun, Moon, Clock } from 'lucide-react';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useWeather } from '@/hooks/useWeather';
import { cn } from '@/lib/utils';

const WEATHER_ICONS = {
  'sun': Sun,
  'moon': Moon,
  'cloud': Cloud,
  'cloud-sun': CloudSun,
  'cloud-moon': CloudMoon,
  'cloud-rain': CloudRain,
  'cloud-lightning': CloudLightning,
};

const ContextBar = () => {
  const { formatTime, formatDate } = useCurrentTime();
  const { location, isLoading: locationLoading } = useGeolocation();
  const { weather, isLoading: weatherLoading } = useWeather();

  const WeatherIcon = WEATHER_ICONS[weather.icon as keyof typeof WEATHER_ICONS] || Sun;

  return (
    <div className="w-full bg-gradient-to-r from-primary/5 via-accent/10 to-primary/5 border-b border-border/50 backdrop-blur-md sticky top-16 z-40">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="h-10 flex items-center justify-center gap-4 md:gap-6 text-sm text-foreground/90 font-medium">
          
          {/* Location Widget */}
          <div className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/40 hover:bg-background/60 transition-all duration-300 hover:scale-105 cursor-pointer">
            <MapPin className="h-4 w-4 text-primary animate-pulse group-hover:animate-none" />
            {locationLoading ? (
              <span className="animate-fade-in">Abidjan</span>
            ) : (
              <span className="font-semibold">{location.city}</span>
            )}
          </div>

          <span className="text-border/40">•</span>

          {/* Weather Widget */}
          <div className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/40 hover:bg-background/60 transition-all duration-300 hover:scale-105 cursor-pointer">
            {weatherLoading ? (
              <>
                <Sun className="h-4 w-4 text-warning animate-spin" />
                <span>...</span>
              </>
            ) : (
              <>
                <WeatherIcon className="h-4 w-4 text-warning group-hover:scale-110 transition-transform" />
                <span className="font-semibold">{weather.temperature}°C</span>
                <span className="text-muted-foreground hidden sm:inline">{weather.description}</span>
              </>
            )}
          </div>

          <span className="text-border/40 hidden md:inline">•</span>

          {/* Time & Date Widget */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/40 hover:bg-background/60 transition-all duration-300 hover:scale-105 cursor-pointer group">
            <Clock className="h-4 w-4 text-primary group-hover:rotate-12 transition-transform" />
            <span className="font-semibold">{formatTime()}</span>
            <span className="text-muted-foreground text-xs">{formatDate()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContextBar;
