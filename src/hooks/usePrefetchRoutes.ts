import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const usePrefetchRoutes = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    // ✅ SÉCURITÉ : Précharger uniquement si l'utilisateur est authentifié
    if (!user) return;

    // Page d'accueil → Précharger propriétés populaires
    if (location.pathname === '/') {
      queryClient.prefetchQuery({
        queryKey: ['properties', 'public', { limit: 20 }],
        queryFn: async () => {
          const { data } = await supabase
            .from('properties')
            .select('*')
            .eq('moderation_status', 'approved')
            .eq('status', 'disponible')
            .order('view_count', { ascending: false })
            .limit(20);
          return data;
        },
        staleTime: 5 * 60 * 1000,
      });
    }

    // ✅ SÉCURITÉ : Ne JAMAIS précharger de données sensibles
    // (applications, messages, données d'administration)
  }, [location.pathname, queryClient, user]);
};
