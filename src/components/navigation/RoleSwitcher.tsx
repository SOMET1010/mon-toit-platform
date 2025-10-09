import { useState, useEffect } from 'react';
import { useRoleSwitch } from '@/hooks/useRoleSwitch';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const RoleSwitcher = () => {
  const { 
    activeRoles, 
    currentRole, 
    availableRoles, 
    isLoading, 
    switchRole,
    fetchActiveRoles,
    hasMultipleRoles 
  } = useRoleSwitch();

  useEffect(() => {
    fetchActiveRoles();
  }, []);

  if (!hasMultipleRoles) return null;

  const isProprietaire = currentRole === 'proprietaire';
  
  const handleToggle = () => {
    const newRole = isProprietaire ? 'locataire' : 'proprietaire';
    switchRole(newRole);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50">
            <Label 
              htmlFor="role-switch" 
              className="text-sm font-medium cursor-pointer"
            >
              {isProprietaire ? '🔑 Propriétaire' : '🏠 Locataire'}
            </Label>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Switch
                id="role-switch"
                checked={isProprietaire}
                onCheckedChange={handleToggle}
                disabled={isLoading}
              />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Basculer entre vos rôles</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
