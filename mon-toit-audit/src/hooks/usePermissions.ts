import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { logger } from '@/services/logger';

interface UsePermissionsReturn {
  canAccessAdminDashboard: boolean;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook pour gérer les permissions utilisateur
 * 
 * Utilisation dans les composants :
 * ```typescript
 * const { canAccessAdminDashboard, loading } = usePermissions();
 * ```
 * 
 * Fonctionnalités :
 * - Détecte si l'utilisateur peut accéder au dashboard admin
 * - Vérifie les permissions selon le rôle utilisateur
 * - Interface avec Supabase pour les données de permissions
 * - Gestion des cas d'erreur et loading states
 */
export const usePermissions = (): UsePermissionsReturn => {
  const { user, roles } = useAuth();
  const [canAccessAdminDashboard, setCanAccessAdminDashboard] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = async () => {
    if (!user) {
      setCanAccessAdminDashboard(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Vérifier si l'utilisateur a le rôle admin ou admin_ansut
      const hasAdminRole = roles.some(role => 
        role === 'admin' || role === 'admin_ansut'
      );

      // Vérification supplémentaire en base de données pour la sécurité
      const { data, error: dbError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'admin_ansut'])
        .maybeSingle();

      if (dbError) {
        // Si erreur de base, on utilise la vérification des rôles en mémoire
        logger.warn('Error fetching permissions from DB, using in-memory roles', { 
          error: dbError, 
          userId: user.id,
          roles 
        });
        setCanAccessAdminDashboard(hasAdminRole);
      } else {
        // Confirmation de la permission via la base de données
        const hasDbAdminRole = !!data;
        setCanAccessAdminDashboard(hasAdminRole && hasDbAdminRole);
        
        logger.info('Permissions checked', {
          userId: user.id,
          roles,
          hasAdminRole,
          hasDbAdminRole,
          canAccessAdminDashboard: hasAdminRole && hasDbAdminRole
        });
      }
    } catch (err) {
      // En cas d'erreur, on deny l'accès par sécurité
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      setCanAccessAdminDashboard(false);
      
      logger.error('Error fetching permissions', { 
        error: err, 
        userId: user.id,
        roles 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [user, roles]);

  return {
    canAccessAdminDashboard,
    loading,
    error,
    refetch: fetchPermissions
  };
};