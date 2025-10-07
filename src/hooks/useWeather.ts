import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/services/logger';

interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
  humidity?: number;
  windSpeed?: number;
}

const FALLBACK_WEATHER: WeatherData = {
  temperature: 28,
  description: 'Ensoleillé',
  icon: 'sun'
};

/**
 * Hook to fetch weather data for Abidjan with localStorage caching
 * Cache duration: 15 minutes
 * Falls back to default sunny weather if API fails
 */

export const useWeather = () => {
  const [weather, setWeather] = useState<WeatherData>(FALLBACK_WEATHER);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Check cache first (15 min)
        const cachedWeather = localStorage.getItem('weather_data');
        const cachedTime = localStorage.getItem('weather_timestamp');
        
        if (cachedWeather && cachedTime) {
          const cacheAge = Date.now() - parseInt(cachedTime);
          if (cacheAge < 15 * 60 * 1000) { // 15 minutes
            setWeather(JSON.parse(cachedWeather));
            setIsLoading(false);
            return;
          }
        }

        const { data, error } = await supabase.functions.invoke('get-weather', {
          body: { city: 'Abidjan' }
        });

        if (error) {
          logger.warn('Weather API error', { error });
          setWeather(FALLBACK_WEATHER);
          setIsLoading(false);
          return;
        }

        if (data?.weather) {
          setWeather(data.weather);
          localStorage.setItem('weather_data', JSON.stringify(data.weather));
          localStorage.setItem('weather_timestamp', Date.now().toString());
        } else {
          setWeather(FALLBACK_WEATHER);
        }
      } catch (error) {
        logger.warn('Weather fetch error', { error });
        setWeather(FALLBACK_WEATHER);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
  }, []);

  return { weather, isLoading };
};
