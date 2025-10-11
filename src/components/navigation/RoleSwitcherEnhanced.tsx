import { useState, useEffect } from 'react';
import { useRoleSwitch } from '@/hooks/useRoleSwitch';
import { Label } from '@/components/ui/label';
import { Loader2, Home, Building2, Users } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type UserType = 'locataire' | 'proprietaire' | 'agence' | 'admin_ansut';

const roleConfig: Record<UserType, { label: string; icon: React.ReactNode }> = {
  locataire: { label: '🏠 Locataire', icon: <Home className="h-4 w-4" /> },
  proprietaire: { label: '🔑 Propriétaire', icon: <Building2 className="h-4 w-4" /> },
  agence: { label: '🏢 Agence', icon: <Users className="h-4 w-4" /> },
  admin_ansut: { label: '👑 Admin ANSUT', icon: <Users className="h-4 w-4" /> },
};

export const RoleSwitcherEnhanced = () => {
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

  const handleRoleChange = (newRole: string) => {
    switchRole(newRole as UserType);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 min-w-[180px]">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Select value={currentRole} onValueChange={handleRoleChange} disabled={isLoading}>
                <SelectTrigger className="border-0 bg-transparent focus:ring-0 shadow-none h-auto p-0">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      {currentRole && roleConfig[currentRole]?.icon}
                      <span className="text-sm font-medium">
                        {currentRole && roleConfig[currentRole]?.label}
                      </span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      <div className="flex items-center gap-2">
                        {roleConfig[role]?.icon}
                        <span>{roleConfig[role]?.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
