import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export const useWeather = () => {
  const [weather, setWeather] = useState<WeatherData>(FALLBACK_WEATHER);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
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

      try {
        const { data, error } = await supabase.functions.invoke('get-weather', {
          body: { city: 'Abidjan' }
        });

        if (error) throw error;

        if (data?.weather) {
          setWeather(data.weather);
          localStorage.setItem('weather_data', JSON.stringify(data.weather));
          localStorage.setItem('weather_timestamp', Date.now().toString());
        }
      } catch (error) {
        console.error('Weather fetch error:', error);
        setWeather(FALLBACK_WEATHER);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
  }, []);

  return { weather, isLoading };
};
