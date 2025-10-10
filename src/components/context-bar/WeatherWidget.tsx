import React, { memo } from 'react';
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  CloudSun,
  CloudMoon,
  Moon,
  RefreshCw
} from 'lucide-react';
import { Widget } from './Widget';
import type { WeatherData } from './types';

const WEATHER_ICONS = {
  'sun': Sun,
  'moon': Moon,
  'cloud': Cloud,
  'cloud-sun': CloudSun,
  'cloud-moon': CloudMoon,
  'cloud-rain': CloudRain,
  'cloud-lightning': CloudLightning,
  'snowflake': CloudSnow
};

interface WeatherWidgetProps {
  weather: WeatherData;
  isLoading: boolean;
  error: Error | null;
  onRefresh: () => void;
}

export const WeatherWidget = memo(({ 
  weather, 
  isLoading, 
  error,
  onRefresh 
}: WeatherWidgetProps) => {
  const WeatherIcon = WEATHER_ICONS[weather.icon as keyof typeof WEATHER_ICONS] || Sun;

  const tooltip = (
    <div className="space-y-1">
      <p className="font-semibold">{weather.temperature}°C - {weather.description}</p>
      {weather.feelsLike && (
        <p className="text-xs text-muted-foreground">
          Ressenti: {weather.feelsLike}°C
        </p>
      )}
      {weather.humidity && (
        <p className="text-xs text-muted-foreground">
          Humidité: {weather.humidity}%
        </p>
      )}
      {weather.windSpeed && (
        <p className="text-xs text-muted-foreground">
          Vent: {weather.windSpeed} km/h
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
      ariaLabel="Météo actuelle - Cliquer pour rafraîchir"
      tooltip={tooltip}
    >
      <WeatherIcon className="h-4 w-4 text-warning group-hover:scale-110 transition-transform" />
      <span className="font-semibold text-sm">{weather.temperature}°C</span>
      <span className="text-xs text-muted-foreground hidden sm:inline">
        {weather.description}
      </span>
    </Widget>
  );
});

WeatherWidget.displayName = 'WeatherWidget';
