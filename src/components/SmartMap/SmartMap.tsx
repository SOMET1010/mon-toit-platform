import { useState, useEffect, useCallback } from 'react';
import Map, { NavigationControl, GeolocateControl, Marker, Popup } from 'react-map-gl';
import { supabase } from '@/lib/supabase';
import { SearchFilters } from './SearchFilters';
import { HeatmapLayer } from './HeatmapLayer';
import { StatsPanel } from './StatsPanel';
import { Button } from '@/components/ui/button';
import { Plus, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Property {
  id: string;
  title: string;
  price: number;
  type: string;
  rooms: number;
  latitude: number;
  longitude: number;
  city: string;
}

interface Filters {
  priceMin?: number;
  priceMax?: number;
  type?: string;
  rooms?: number;
  city?: string;
}

export function SmartMap() {
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [filters, setFilters] = useState<Filters>({});
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [loading, setLoading] = useState(true);

  // Récupérer le token Mapbox depuis Supabase secrets
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'mapbox_token')
          .single();

        if (error) {
          console.error('Erreur récupération token Mapbox:', error);
          // Fallback : utiliser une variable d'environnement si disponible
          const envToken = import.meta.env.VITE_MAPBOX_TOKEN;
          if (envToken) {
            setMapboxToken(envToken);
          }
        } else if (data) {
          setMapboxToken(data.value);
        }
      } catch (err) {
        console.error('Erreur:', err);
      }
    };

    fetchMapboxToken();
  }, []);

  // Charger les propriétés
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('id, title, price, type, rooms, latitude, longitude, city')
          .not('latitude', 'is', null)
          .not('longitude', 'is', null);

        if (error) throw error;
        
        setProperties(data || []);
        setFilteredProperties(data || []);
      } catch (error) {
        console.error('Erreur chargement propriétés:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Appliquer les filtres
  useEffect(() => {
    let filtered = [...properties];

    if (filters.priceMin) {
      filtered = filtered.filter(p => p.price >= filters.priceMin!);
    }
    if (filters.priceMax) {
      filtered = filtered.filter(p => p.price <= filters.priceMax!);
    }
    if (filters.type) {
      filtered = filtered.filter(p => p.type === filters.type);
    }
    if (filters.rooms) {
      filtered = filtered.filter(p => p.rooms >= filters.rooms!);
    }
    if (filters.city) {
      filtered = filtered.filter(p => p.city.toLowerCase().includes(filters.city!.toLowerCase()));
    }

    setFilteredProperties(filtered);
  }, [filters, properties]);

  const handleFilterChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
  }, []);

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!mapboxToken) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Token Mapbox non configuré</p>
          <p className="text-sm text-muted-foreground mt-2">
            Veuillez configurer le token dans les paramètres Supabase
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Filtres */}
      <SearchFilters
        onFilterChange={handleFilterChange}
        onToggleHeatmap={() => setShowHeatmap(!showHeatmap)}
        showHeatmap={showHeatmap}
        propertiesCount={filteredProperties.length}
      />

      {/* Carte */}
      <div className="h-[80vh] w-full rounded-xl overflow-hidden shadow-lg">
        <Map
          mapboxAccessToken={mapboxToken}
          initialViewState={{
            longitude: -4.008,
            latitude: 5.35,
            zoom: 11,
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
        >
          <NavigationControl position="top-right" />
          <GeolocateControl position="top-right" />

          {/* Heatmap */}
          {showHeatmap && <HeatmapLayer properties={filteredProperties} />}

          {/* Markers */}
          {!showHeatmap && filteredProperties.map((property) => (
            <Marker
              key={property.id}
              longitude={property.longitude}
              latitude={property.latitude}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setSelectedProperty(property);
              }}
            >
              <div className="cursor-pointer transform hover:scale-110 transition-transform">
                <MapPin className="h-8 w-8 text-primary fill-primary drop-shadow-lg" />
              </div>
            </Marker>
          ))}

          {/* Popup */}
          {selectedProperty && (
            <Popup
              longitude={selectedProperty.longitude}
              latitude={selectedProperty.latitude}
              anchor="bottom"
              onClose={() => setSelectedProperty(null)}
              closeButton={true}
              closeOnClick={false}
            >
              <div className="p-2 min-w-[200px]">
                <h3 className="font-semibold text-sm mb-1">{selectedProperty.title}</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {selectedProperty.price.toLocaleString('fr-FR')} FCFA/mois
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  {selectedProperty.type} • {selectedProperty.rooms} pièces
                </p>
                <Link to={`/property/${selectedProperty.id}`}>
                  <Button size="sm" className="w-full text-xs">
                    Voir le bien
                  </Button>
                </Link>
              </div>
            </Popup>
          )}
        </Map>
      </div>

      {/* Statistiques */}
      <StatsPanel properties={filteredProperties} />

      {/* CTA flottant */}
      <Link to="/publier">
        <Button
          size="lg"
          className="fixed bottom-6 right-6 shadow-2xl bg-orange-500 hover:bg-orange-600 text-white z-50"
        >
          <Plus className="h-5 w-5 mr-2" />
          Publier un bien
        </Button>
      </Link>
    </div>
  );
}

