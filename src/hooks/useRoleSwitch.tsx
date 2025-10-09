import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from './use-toast';

type UserType = 'locataire' | 'proprietaire' | 'agence' | 'admin_ansut';

export interface UserActiveRoles {
  user_id: string;
  available_roles: UserType[];
  current_role: UserType;
  created_at: string;
  updated_at: string;
}

export const useRoleSwitch = () => {
  const { user, refreshProfile } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [activeRoles, setActiveRoles] = useState<UserActiveRoles | null>(null);

  const fetchActiveRoles = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('user_active_roles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      console.error('Error fetching active roles:', error);
      return;
    }
    
    setActiveRoles(data);
  };

  const switchRole = async (newRole: UserType) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('switch-role', {
        body: { newRole }
      });

      if (error) throw error;

      toast({
        title: "✅ Rôle changé",
        description: data.message || `Vous êtes maintenant ${newRole}`,
      });

      await refreshProfile();
      await fetchActiveRoles();
      queryClient.invalidateQueries();
      
      setTimeout(() => {
        window.location.reload();
      }, 500);

    } catch (error: any) {
      console.error('Error switching role:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de changer de rôle",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addAvailableRole = async (newRole: UserType) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.rpc('add_available_role', {
        p_user_id: user.id,
        p_new_role: newRole
      });
      
      if (error) throw error;
      
      toast({
        title: "✅ Rôle ajouté",
        description: `Le rôle ${newRole} est maintenant disponible`,
      });
      
      await fetchActiveRoles();
      
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    activeRoles,
    currentRole: activeRoles?.current_role,
    availableRoles: activeRoles?.available_roles || [],
    isLoading,
    switchRole,
    addAvailableRole,
    fetchActiveRoles,
    hasMultipleRoles: (activeRoles?.available_roles?.length || 0) > 1,
  };
};
