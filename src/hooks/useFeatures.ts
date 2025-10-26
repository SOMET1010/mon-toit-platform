/**
 * Hook React Query pour accéder aux fonctionnalités de la plateforme depuis Supabase
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export type FeatureCategory = 'core' | 'certification' | 'payment' | 'security' | 'other';

export interface Feature {
  id: string;
  icon: string; // Nom de l'icône Lucide
  title: string;
  description: string;
  category: FeatureCategory;
  is_highlighted: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Hook pour récupérer toutes les fonctionnalités
 */
export const useFeatures = () => {
  return useQuery<Feature[]>({
    queryKey: ['features'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('features')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        throw new Error(`Erreur lors du chargement des fonctionnalités: ${error.message}`);
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 60, // 1 heure
  });
};

/**
 * Hook pour récupérer uniquement les fonctionnalités mises en avant
 */
export const useHighlightedFeatures = () => {
  return useQuery<Feature[]>({
    queryKey: ['features', 'highlighted'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('features')
        .select('*')
        .eq('is_highlighted', true)
        .order('display_order', { ascending: true });

      if (error) {
        throw new Error(`Erreur lors du chargement des fonctionnalités: ${error.message}`);
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 60,
  });
};

/**
 * Hook pour récupérer les fonctionnalités par catégorie
 */
export const useFeaturesByCategory = (category: FeatureCategory) => {
  return useQuery<Feature[]>({
    queryKey: ['features', 'category', category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('features')
        .select('*')
        .eq('category', category)
        .order('display_order', { ascending: true });

      if (error) {
        throw new Error(`Erreur lors du chargement des fonctionnalités: ${error.message}`);
      }

      return data || [];
    },
    enabled: !!category,
    staleTime: 1000 * 60 * 60,
  });
};

