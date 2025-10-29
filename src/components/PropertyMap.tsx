import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from './ui/button';
import { Locate, Map, Satellite, Layers } from 'lucide-react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { logger } from '@/services/logger';
import { secureStorage } from '@/lib/secureStorage';
import { supabase } from '@/lib/supabase';

// Force rebuild: 2025-10-29 09:21 UTC - RPC Supabase corrections applied
// Build version: v2.1 - Mapbox RPC integration complete - FINAL

interface Property {
  id: string;
  title: string;
  city: string;
  monthly_rent: number;
  latitude: number | null;
  longitude: number | null;
  main_image: string | null;
}

interface PropertyMapProps {
  properties: Property[];
  onPropertyClick?: (propertyId: string) => void;
  onLocationSearch?: (lat: number, lng: number) => void;
  showLocationButton?: boolean;
}

const getMapboxConfig = async () => {
  try {
    // Appeler la fonction RPC Supabase pour récupérer la config Mapbox
    const { data, error } = await supabase.rpc('get_mapbox_config');
    
    if (error) {
      logger.error('[PropertyMap] Erreur récupération config Mapbox:', error);
      throw new Error('Token Mapbox non configuré - Veuillez configurer le token dans les paramètres Supabase');
    }
    
    if (!data || !data.token) {
      throw new Error('Token Mapbox non trouvé dans la configuration');
    }
    
    return data;
  } catch (error) {
    logger.error('[PropertyMap] Erreur getMapboxConfig:', error);
    throw error;
  }
};


type MapStyle = 'streets' | 'satellite' | 'hybrid';

const MAP_STYLES: Record<MapStyle, string> = {
  streets: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-v9',
  hybrid: 'mapbox://styles/mapbox/satellite-streets-v12',
};

const PropertyMap = ({ 
  properties, 
  onPropertyClick, 
  onLocationSearch,
  showLocationButton = true 
}: PropertyMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [locating, setLocating] = useState(false);
  const [mapStyle, setMapStyle] = useState<MapStyle>(() => {
    return (secureStorage.getItem('preferredMapStyle') as MapStyle) || 'streets';
  });
  const [mapboxConfig, setMapboxConfig] = useState<any>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  // Récupérer la config Mapbox depuis Supabase au chargement
  useEffect(() => {
    const fetchConfig = async () => {
      setLoadingConfig(true);
      try {
        const config = await getMapboxConfig();
        setMapboxConfig(config);
        logger.info('[PropertyMap] Config Mapbox récupérée depuis Supabase');
      } catch (error: any) {
        logger.error('[PropertyMap] Erreur récupération config:', error);
        setConfigError(error.message || 'Erreur de configuration Mapbox');
      } finally {
        setLoadingConfig(false);
      }
    };
    
    fetchConfig();
  }, []);



  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      if (!mapboxConfig || !mapboxConfig.token) {
        logger.warn('[PropertyMap] Config Mapbox non disponible');
        return;
      }

      // Nettoyer le token (enlever les quotes PostgreSQL si présentes)
      const cleanToken = mapboxConfig.token.replace(/^"|"$/g, '');
      mapboxgl.accessToken = cleanToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: MAP_STYLES[mapStyle],
        center: [-4.0305, 5.3599], // Abidjan coordinates
        zoom: 11,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

      map.current.on('load', () => {
        setMapReady(true);
      });
    } catch (error) {
      logger.logError(error, { context: 'Map initialization' });
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [mapStyle, mapboxConfig]);

  // Function to add markers to the map
  const addMarkersToMap = () => {
    if (!map.current || !mapReady) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Filter properties with valid coordinates
    const validProperties = properties.filter(
      p => p.latitude !== null && p.longitude !== null
    );

    if (validProperties.length === 0) return;

    // Add markers for each property with enhanced styling
    validProperties.forEach(property => {
      const el = document.createElement('div');
      el.className = 'property-marker';
      
      // Enhanced marker styling with ANSUT colors - using safe DOM manipulation
      const markerContainer = document.createElement('div');
      markerContainer.className = 'relative group';

      const glowEffect = document.createElement('div');
      glowEffect.className = 'absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-25 group-hover:opacity-50 transition-opacity';

      const markerContent = document.createElement('div');
      markerContent.className = 'relative w-10 h-10 rounded-full bg-primary border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs group-hover:scale-110 transition-transform';
      markerContent.textContent = `${(property.monthly_rent / 1000).toFixed(0)}k`;

      markerContainer.appendChild(glowEffect);
      markerContainer.appendChild(markerContent);
      el.appendChild(markerContainer);
      el.style.cursor = 'pointer';

      // Enhanced popup with safe DOM manipulation to prevent XSS
      const popupContent = document.createElement('div');
      popupContent.className = 'min-w-[200px]';

      if (property.main_image) {
        const img = document.createElement('img');
        img.src = property.main_image;
        img.alt = property.title;
        img.className = 'w-full h-32 object-cover rounded-t-lg mb-2';
        popupContent.appendChild(img);
      }

      const contentDiv = document.createElement('div');
      contentDiv.className = 'p-3';

      const title = document.createElement('h3');
      title.className = 'font-semibold text-sm mb-2 text-foreground';
      title.textContent = property.title;
      contentDiv.appendChild(title);

      const locationDiv = document.createElement('div');
      locationDiv.className = 'flex items-center gap-1 text-xs text-muted-foreground mb-2';

      const svgIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgIcon.setAttribute('class', 'w-3 h-3');
      svgIcon.setAttribute('fill', 'none');
      svgIcon.setAttribute('stroke', 'currentColor');
      svgIcon.setAttribute('viewBox', '0 0 24 24');

      const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path1.setAttribute('stroke-linecap', 'round');
      path1.setAttribute('stroke-linejoin', 'round');
      path1.setAttribute('stroke-width', '2');
      path1.setAttribute('d', 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z');

      const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path2.setAttribute('stroke-linecap', 'round');
      path2.setAttribute('stroke-linejoin', 'round');
      path2.setAttribute('stroke-width', '2');
      path2.setAttribute('d', 'M15 11a3 3 0 11-6 0 3 3 0 016 0z');

      svgIcon.appendChild(path1);
      svgIcon.appendChild(path2);

      const citySpan = document.createElement('span');
      citySpan.textContent = property.city;

      locationDiv.appendChild(svgIcon);
      locationDiv.appendChild(citySpan);
      contentDiv.appendChild(locationDiv);

      const pricePara = document.createElement('p');
      pricePara.className = 'text-base font-bold text-primary';

      const priceSpan = document.createElement('span');
      priceSpan.textContent = `${property.monthly_rent.toLocaleString()} FCFA`;

      const perMonthSpan = document.createElement('span');
      perMonthSpan.className = 'text-xs font-normal';
      perMonthSpan.textContent = '/mois';

      pricePara.appendChild(priceSpan);
      pricePara.appendChild(perMonthSpan);
      contentDiv.appendChild(pricePara);

      popupContent.appendChild(contentDiv);

      const popup = new mapboxgl.Popup({
        offset: 25,
        className: 'property-popup'
      }).setDOMContent(popupContent);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([property.longitude!, property.latitude!])
        .setPopup(popup)
        .addTo(map.current!);

      el.addEventListener('click', () => {
        if (onPropertyClick) {
          onPropertyClick(property.id);
        }
      });

      markers.current.push(marker);
    });

    // Fit map to show all markers
    if (validProperties.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      validProperties.forEach(property => {
        bounds.extend([property.longitude!, property.latitude!]);
      });
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 15 });
    }
  };

  // Update markers when properties change
  useEffect(() => {
    addMarkersToMap();
  }, [properties, mapReady, onPropertyClick]);

  // Handle map style change
  const handleStyleChange = (newStyle: MapStyle) => {
    if (!map.current || mapStyle === newStyle) return;
    
    setMapStyle(newStyle);
    secureStorage.setItem('preferredMapStyle', newStyle, true);
    
    map.current.once('style.load', () => {
      addMarkersToMap();
    });
    
    map.current.setStyle(MAP_STYLES[newStyle]);
  };

  const handleLocateMe = () => {
    setLocating(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          if (map.current) {
            map.current.flyTo({
              center: [longitude, latitude],
              zoom: 13,
              essential: true
            });

            // Add user location marker
            new mapboxgl.Marker({ color: '#3b82f6' })
              .setLngLat([longitude, latitude])
              .addTo(map.current);
          }

          if (onLocationSearch) {
            onLocationSearch(latitude, longitude);
          }
          
          setLocating(false);
        },
        (error) => {
          logger.logError(error, { context: 'Geolocation' });
          setLocating(false);
        }
      );
    } else {
      setLocating(false);
    }
  };

  return (
    <div className="relative w-full h-[600px]">
      {loadingConfig ? (
        <Card className="p-6 flex flex-col items-center justify-center h-full">
          <h3 className="text-lg font-semibold mb-4">Chargement de la carte...</h3>
          <p className="text-sm text-muted-foreground">Récupération de la configuration Mapbox</p>
        </Card>
      ) : configError ? (
        <Card className="p-6 flex flex-col items-center justify-center h-full">
          <h3 className="text-lg font-semibold mb-4 text-destructive">Erreur de configuration</h3>
          <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
            {configError}
          </p>
          <p className="text-xs text-muted-foreground text-center">
            Veuillez contacter l'administrateur pour configurer le token Mapbox dans Supabase.
          </p>
        </Card>
      ) : (
        <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
      )}
      
      {mapboxConfig && showLocationButton && (
        <div className="absolute top-4 left-4 z-10">
          <Button
            onClick={handleLocateMe}
            disabled={locating}
            size="sm"
            className="shadow-lg"
          >
            <Locate className="h-4 w-4 mr-2" />
            {locating ? 'Localisation...' : 'Autour de moi'}
          </Button>
        </div>
      )}

      {mapboxConfig && (
        <div className="absolute top-16 left-4 z-10 flex flex-col gap-2">
        <Button
          onClick={() => handleStyleChange('streets')}
          size="sm"
          variant={mapStyle === 'streets' ? 'default' : 'outline'}
          className="shadow-lg"
        >
          <Map className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Rues</span>
        </Button>
        <Button
          onClick={() => handleStyleChange('satellite')}
          size="sm"
          variant={mapStyle === 'satellite' ? 'default' : 'outline'}
          className="shadow-lg"
        >
          <Satellite className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Satellite</span>
        </Button>
        <Button
          onClick={() => handleStyleChange('hybrid')}
          size="sm"
          variant={mapStyle === 'hybrid' ? 'default' : 'outline'}
          className="shadow-lg"
        >
          <Layers className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Hybride</span>
        </Button>
        </div>
      )}

      {mapboxConfig && properties.filter(p => p.latitude === null || p.longitude === null).length > 0 && (
        <Card className="absolute bottom-4 left-4 right-4 p-3 z-10 bg-background/95 backdrop-blur">
          <p className="text-sm text-muted-foreground">
            {properties.filter(p => p.latitude === null || p.longitude === null).length} bien(s) sans géolocalisation
          </p>
        </Card>
      )}
    </div>
  );
};

export default PropertyMap;
