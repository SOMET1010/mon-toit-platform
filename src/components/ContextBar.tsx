import { MapPin, Cloud, CloudRain, CloudLightning, CloudSun, CloudMoon, Sun, Moon, Clock } from 'lucide-react';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useWeather } from '@/hooks/useWeather';

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
    <div className="w-full bg-accent/30 border-b border-border backdrop-blur-sm sticky top-16 z-40">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="h-9 flex items-center justify-center gap-3 md:gap-4 text-xs md:text-sm text-foreground/80 font-medium">{/* Location */}
          {/* Location */}
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
            {locationLoading ? (
              <span>Abidjan</span>
            ) : (
              <span>
                {location.city}{location.neighborhood ? `, ${location.neighborhood}` : ''}
              </span>
            )}
          </div>

          <span className="text-border">|</span>

          {/* Weather */}
          <div className="flex items-center gap-1.5">
            {weatherLoading ? (
              <>
                <Sun className="h-3.5 w-3.5 md:h-4 md:w-4 text-warning" />
                <span>Chargement...</span>
              </>
            ) : (
              <>
                <WeatherIcon className="h-3.5 w-3.5 md:h-4 md:w-4 text-warning" />
                <span>{weather.temperature}°C, {weather.description}</span>
              </>
            )}
          </div>

          <span className="text-border hidden md:inline">|</span>

          {/* Time & Date */}
          <div className="hidden md:flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-primary" />
            <span>{formatDate()}, {formatTime()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContextBar;
