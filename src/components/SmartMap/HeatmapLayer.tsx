import { Source, Layer } from 'react-map-gl';
import type { HeatmapLayer as MapboxHeatmapLayer } from 'mapbox-gl';

interface Property {
  id: string;
  latitude: number;
  longitude: number;
  price: number;
}

interface HeatmapLayerProps {
  properties: Property[];
}

export function HeatmapLayer({ properties }: HeatmapLayerProps) {
  // Convertir les propriétés en GeoJSON
  const geojson = {
    type: 'FeatureCollection' as const,
    features: properties.map((property) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [property.longitude, property.latitude],
      },
      properties: {
        price: property.price,
      },
    })),
  };

  const heatmapLayer: MapboxHeatmapLayer = {
    id: 'price-heatmap',
    type: 'heatmap',
    paint: {
      // Poids basé sur le prix
      'heatmap-weight': [
        'interpolate',
        ['linear'],
        ['get', 'price'],
        0,
        0,
        1000000,
        1,
      ],
      // Intensité de la heatmap
      'heatmap-intensity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        0,
        1,
        15,
        3,
      ],
      // Rayon des points
      'heatmap-radius': [
        'interpolate',
        ['linear'],
        ['zoom'],
        0,
        2,
        15,
        20,
      ],
      // Couleurs : vert (bas prix) → orange → rouge (prix élevés)
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0,
        'rgba(0, 158, 96, 0)',
        0.2,
        'rgba(0, 158, 96, 0.4)',
        0.4,
        'rgba(247, 127, 0, 0.6)',
        0.6,
        'rgba(247, 127, 0, 0.8)',
        0.8,
        'rgba(220, 38, 38, 0.9)',
        1,
        'rgba(220, 38, 38, 1)',
      ],
      // Opacité
      'heatmap-opacity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        7,
        0.8,
        15,
        0.6,
      ],
    },
  };

  return (
    <Source id="properties-heatmap" type="geojson" data={geojson}>
      <Layer {...heatmapLayer} />
    </Source>
  );
}

