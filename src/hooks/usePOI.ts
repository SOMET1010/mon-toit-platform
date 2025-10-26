/**
 * Hook React Query pour accéder aux Points d'Intérêt (POI) d'Abidjan depuis Supabase
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export type POIType = 'school' | 'transport' | 'hospital' | 'market' | 'mall' | 'restaurant';

export interface POI {
  id: string;
  name: string;
  type: POIType;
  latitude: number;
  longitude: number;
  neighborhood: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Hook pour récupérer tous les POI
 */
export const usePOI = () => {
  return useQuery<POI[]>({
    queryKey: ['poi'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('poi')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw new Error(`Erreur lors du chargement des POI: ${error.message}`);
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 60, // 1 heure
  });
};

/**
 * Hook pour récupérer les POI par type
 */
export const usePOIByType = (type: POIType) => {
  return useQuery<POI[]>({
    queryKey: ['poi', 'type', type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('poi')
        .select('*')
        .eq('type', type)
        .order('name', { ascending: true });

      if (error) {
        throw new Error(`Erreur lors du chargement des POI: ${error.message}`);
      }

      return data || [];
    },
    enabled: !!type,
    staleTime: 1000 * 60 * 60,
  });
};

/**
 * Hook pour récupérer les POI d'un quartier spécifique
 */
export const usePOIByNeighborhood = (neighborhoodId: string) => {
  return useQuery<POI[]>({
    queryKey: ['poi', 'neighborhood', neighborhoodId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('poi')
        .select('*')
        .eq('neighborhood', neighborhoodId)
        .order('name', { ascending: true });

      if (error) {
        throw new Error(`Erreur lors du chargement des POI: ${error.message}`);
      }

      return data || [];
    },
    enabled: !!neighborhoodId,
    staleTime: 1000 * 60 * 60,
  });
};

/**
 * Catégories de POI avec labels et icônes
 */
export const POI_CATEGORIES = {
  school: {
    label: 'Écoles',
    icon: '🏫',
    color: '#3b82f6',
  },
  transport: {
    label: 'Transports',
    icon: '🚌',
    color: '#8b5cf6',
  },
  hospital: {
    label: 'Hôpitaux',
    icon: '🏥',
    color: '#ef4444',
  },
  market: {
    label: 'Marchés',
    icon: '🏪',
    color: '#f59e0b',
  },
  mall: {
    label: 'Centres commerciaux',
    icon: '🏬',
    color: '#10b981',
  },
  restaurant: {
    label: 'Restaurants',
    icon: '🍽️',
    color: '#ec4899',
  },
} as const;

