import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export type UserRole = 'locataire' | 'proprietaire' | 'agence' | 'admin_ansut';

interface RoleMetadata {
  enabled: boolean;
  verified: boolean;
  verification_method?: string;
  verification_date?: string;
  added_at: string;
}

interface UserRoles {
  user_id: string;
  roles: Record<UserRole, RoleMetadata>;
  active_role: UserRole;
  last_switch_at: string | null;
  switch_count_today: number;
  switch_count_total: number;
}

interface SwitchRoleResponse {
  success: boolean;
  message: string;
  oldRole: UserRole;
  newRole: UserRole;
  remainingSwitchesToday: number;
  cooldownMinutes: number;
}

const roleLabels: Record<UserRole, string> = {
  locataire: '🏠 Locataire',
  proprietaire: '🔑 Propriétaire',
  agence: '🏢 Agence',
  admin_ansut: '👨‍💼 Admin ANSUT'
};

/**
 * Hook pour gérer le changement de rôle V2
 * - Cooldown de 15 minutes entre changements
 * - Maximum 3 changements par jour
 * - Pas de rechargement de page
 * - Mise à jour optimiste du cache
 */
export const useRoleSwitchV2 = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Récupérer les rôles de l'utilisateur
  const { data: userRoles, isLoading: isLoadingRoles, refetch: refetchRoles } = useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data as UserRoles;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutation pour changer de rôle
  const switchRoleMutation = useMutation({
    mutationFn: async (newRole: UserRole) => {
      const { data, error } = await supabase.functions.invoke('switch-role-v2', {
        body: { newRole }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.message || data.error);

      return data as SwitchRoleResponse;
    },

    onMutate: async (newRole) => {
      // Annuler les requêtes en cours
      await queryClient.cancelQueries({ queryKey: ['user-roles', user?.id] });

      // Sauvegarder l'état précédent
      const previousRoles = queryClient.getQueryData<UserRoles>(['user-roles', user?.id]);

      // Mise à jour optimiste
      if (previousRoles) {
        queryClient.setQueryData<UserRoles>(['user-roles', user?.id], {
          ...previousRoles,
          active_role: newRole,
          last_switch_at: new Date().toISOString(),
          switch_count_today: previousRoles.switch_count_today + 1,
          switch_count_total: previousRoles.switch_count_total + 1,
        });
      }

      return { previousRoles };
    },

    onSuccess: (data) => {
      // Invalider les requêtes dépendantes du rôle
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['leases'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      // Toast de succès
      toast({
        title: '✅ Rôle changé',
        description: `${data.message}. Changements restants aujourd'hui : ${data.remainingSwitchesToday}/3`,
        duration: 3000,
      });
    },

    onError: (error: any, newRole, context) => {
      // Rollback en cas d'erreur
      if (context?.previousRoles) {
        queryClient.setQueryData(['user-roles', user?.id], context.previousRoles);
      }

      // Toast d'erreur
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de changer de rôle',
        variant: 'destructive',
        duration: 5000,
      });
    },

    onSettled: () => {
      // Rafraîchir les rôles après mutation
      refetchRoles();
    }
  });

  // Mutation pour ajouter un rôle disponible
  const addRoleMutation = useMutation({
    mutationFn: async ({ 
      role, 
      verificationMethod 
    }: { 
      role: UserRole; 
      verificationMethod?: string 
    }) => {
      const { data, error } = await supabase.rpc('add_user_role', {
        p_user_id: user?.id,
        p_role: role,
        p_verification_method: verificationMethod,
        p_verification_date: new Date().toISOString()
      });

      if (error) throw error;
      return data;
    },

    onSuccess: (_, variables) => {
      toast({
        title: '✅ Rôle ajouté',
        description: `Le rôle ${roleLabels[variables.role]} a été ajouté à votre compte.`,
        duration: 3000,
      });

      // Rafraîchir les rôles
      refetchRoles();
    },

    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'ajouter le rôle',
        variant: 'destructive',
        duration: 5000,
      });
    }
  });

  // Calculer si l'utilisateur peut changer de rôle maintenant
  const canSwitchNow = () => {
    if (!userRoles) return false;

    // Vérifier le cooldown (15 minutes)
    if (userRoles.last_switch_at) {
      const lastSwitchTime = new Date(userRoles.last_switch_at).getTime();
      const now = Date.now();
      const minutesSince = (now - lastSwitchTime) / 1000 / 60;

      if (minutesSince < 15) {
        return false;
      }
    }

    // Vérifier la limite quotidienne (3 changements)
    const today = new Date().setHours(0, 0, 0, 0);
    const lastSwitchDay = userRoles.last_switch_at 
      ? new Date(userRoles.last_switch_at).setHours(0, 0, 0, 0)
      : 0;
    
    const countToday = today > lastSwitchDay ? 0 : userRoles.switch_count_today;

    return countToday < 3;
  };

  // Calculer le temps restant avant le prochain changement
  const getRemainingCooldownMinutes = () => {
    if (!userRoles?.last_switch_at) return 0;

    const lastSwitchTime = new Date(userRoles.last_switch_at).getTime();
    const now = Date.now();
    const minutesSince = (now - lastSwitchTime) / 1000 / 60;
    const remaining = Math.max(0, 15 - minutesSince);

    return Math.ceil(remaining);
  };

  // Obtenir les rôles disponibles
  const getAvailableRoles = (): UserRole[] => {
    if (!userRoles) return [];
    return Object.keys(userRoles.roles).filter(
      role => userRoles.roles[role as UserRole]?.enabled
    ) as UserRole[];
  };

  return {
    // État
    userRoles,
    isLoadingRoles,
    activeRole: userRoles?.active_role,
    availableRoles: getAvailableRoles(),
    switchCountToday: userRoles?.switch_count_today || 0,
    remainingSwitchesToday: Math.max(0, 3 - (userRoles?.switch_count_today || 0)),
    canSwitchNow: canSwitchNow(),
    remainingCooldownMinutes: getRemainingCooldownMinutes(),

    // Actions
    switchRole: switchRoleMutation.mutate,
    addRole: addRoleMutation.mutate,
    refetchRoles,

    // Loading states
    isSwitching: switchRoleMutation.isPending,
    isAddingRole: addRoleMutation.isPending,

    // Labels
    roleLabels,
  };
};

