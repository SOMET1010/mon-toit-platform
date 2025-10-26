/**
 * Hook React Query pour accéder aux quartiers d'Abidjan depuis Supabase
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Neighborhood {
  id: string;
  name: string;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  center: {
    latitude: number;
    longitude: number;
  };
  price_range: {
    min: number;
    max: number;
    average: number;
  };
  scores: {
    transport: number;
    commerce: number;
    education: number;
    security: number;
    healthcare: number;
  };
  description: string;
  characteristics: string[];
  population?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Hook pour récupérer tous les quartiers d'Abidjan
 */
export const useNeighborhoods = () => {
  return useQuery<Neighborhood[]>({
    queryKey: ['neighborhoods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('neighborhoods')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw new Error(`Erreur lors du chargement des quartiers: ${error.message}`);
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 60, // 1 heure (les quartiers changent rarement)
  });
};

/**
 * Hook pour récupérer un quartier spécifique par son ID
 */
export const useNeighborhood = (id: string) => {
  return useQuery<Neighborhood | null>({
    queryKey: ['neighborhoods', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('neighborhoods')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Quartier non trouvé
        }
        throw new Error(`Erreur lors du chargement du quartier: ${error.message}`);
      }

      return data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 60,
  });
};

/**
 * Fonction utilitaire pour obtenir la couleur selon le prix moyen
 */
export const getPriceColor = (avgPrice: number): string => {
  if (avgPrice < 150000) return '#10b981'; // Vert - Abordable
  if (avgPrice < 300000) return '#f59e0b'; // Orange - Moyen
  if (avgPrice < 500000) return '#ef4444'; // Rouge - Cher
  return '#8b5cf6'; // Violet - Très cher
};

/**
 * Fonction pour obtenir le label de prix
 */
export const getPriceLabel = (avgPrice: number): string => {
  if (avgPrice < 150000) return '< 150k FCFA';
  if (avgPrice < 300000) return '150k - 300k FCFA';
  if (avgPrice < 500000) return '300k - 500k FCFA';
  return '> 500k FCFA';
};

