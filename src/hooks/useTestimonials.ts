/**
 * Hook React Query pour accéder aux témoignages clients depuis Supabase
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  profession?: string;
  location?: string;
  rating?: number;
  quote: string;
  photo_url?: string;
  is_featured: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Hook pour récupérer tous les témoignages
 */
export const useTestimonials = () => {
  return useQuery<Testimonial[]>({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        throw new Error(`Erreur lors du chargement des témoignages: ${error.message}`);
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

/**
 * Hook pour récupérer uniquement les témoignages mis en avant
 */
export const useFeaturedTestimonials = () => {
  return useQuery<Testimonial[]>({
    queryKey: ['testimonials', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_featured', true)
        .order('display_order', { ascending: true });

      if (error) {
        throw new Error(`Erreur lors du chargement des témoignages: ${error.message}`);
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 30,
  });
};

/**
 * Hook pour récupérer les témoignages avec une note minimale
 */
export const useTestimonialsByRating = (minRating: number = 4) => {
  return useQuery<Testimonial[]>({
    queryKey: ['testimonials', 'rating', minRating],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .gte('rating', minRating)
        .order('rating', { ascending: false })
        .order('display_order', { ascending: true });

      if (error) {
        throw new Error(`Erreur lors du chargement des témoignages: ${error.message}`);
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 30,
  });
};

