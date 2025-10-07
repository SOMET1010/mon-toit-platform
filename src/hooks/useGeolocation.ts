import { useState, useEffect } from 'react';

interface GeolocationData {
  city: string;
  neighborhood?: string;
  latitude?: number;
  longitude?: number;
}

const ABIDJAN_NEIGHBORHOODS = [
  { name: 'Cocody', lat: 5.3599, lng: -3.9889, bounds: { latMin: 5.32, latMax: 5.40, lngMin: -4.02, lngMax: -3.95 } },
  { name: 'Plateau', lat: 5.3244, lng: -4.0125, bounds: { latMin: 5.31, latMax: 5.34, lngMin: -4.03, lngMax: -4.00 } },
  { name: 'Marcory', lat: 5.2869, lng: -3.9967, bounds: { latMin: 5.27, latMax: 5.31, lngMin: -4.01, lngMax: -3.98 } },
  { name: 'Yopougon', lat: 5.3456, lng: -4.0889, bounds: { latMin: 5.30, latMax: 5.39, lngMin: -4.15, lngMax: -4.05 } },
  { name: 'Abobo', lat: 5.4167, lng: -4.0167, bounds: { latMin: 5.38, latMax: 5.45, lngMin: -4.05, lngMax: -3.98 } },
  { name: 'Adjamé', lat: 5.3500, lng: -4.0333, bounds: { latMin: 5.33, latMax: 5.37, lngMin: -4.05, lngMax: -4.01 } },
  { name: 'Treichville', lat: 5.2889, lng: -4.0089, bounds: { latMin: 5.27, latMax: 5.31, lngMin: -4.03, lngMax: -4.00 } },
  { name: 'Koumassi', lat: 5.3000, lng: -3.9500, bounds: { latMin: 5.28, latMax: 5.32, lngMin: -3.97, lngMax: -3.93 } },
  { name: 'Port-Bouët', lat: 5.2500, lng: -3.9333, bounds: { latMin: 5.23, latMax: 5.27, lngMin: -3.96, lngMax: -3.91 } },
  { name: 'Attécoubé', lat: 5.3333, lng: -4.0500, bounds: { latMin: 5.31, latMax: 5.36, lngMin: -4.08, lngMax: -4.03 } }
];

const detectNeighborhood = (lat: number, lng: number): string | undefined => {
  for (const neighborhood of ABIDJAN_NEIGHBORHOODS) {
    if (
      lat >= neighborhood.bounds.latMin &&
      lat <= neighborhood.bounds.latMax &&
      lng >= neighborhood.bounds.lngMin &&
      lng <= neighborhood.bounds.lngMax
    ) {
      return neighborhood.name;
    }
  }
  return undefined;
};

export const useGeolocation = () => {
  const [location, setLocation] = useState<GeolocationData>({
    city: 'Abidjan',
    neighborhood: undefined
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedLocation = localStorage.getItem('user_location');
    
    if (savedLocation) {
      setLocation(JSON.parse(savedLocation));
      setIsLoading(false);
      return;
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const neighborhood = detectNeighborhood(latitude, longitude);
          
          const locationData: GeolocationData = {
            city: 'Abidjan',
            neighborhood,
            latitude,
            longitude
          };
          
          setLocation(locationData);
          localStorage.setItem('user_location', JSON.stringify(locationData));
          setIsLoading(false);
        },
        () => {
          // Fallback to default
          setLocation({ city: 'Abidjan' });
          setIsLoading(false);
        }
      );
    } else {
      setLocation({ city: 'Abidjan' });
      setIsLoading(false);
    }
  }, []);

  return { location, isLoading };
};
