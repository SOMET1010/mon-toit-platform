import { useState, useEffect } from 'react';
import { useRoleSwitch } from '@/hooks/useRoleSwitch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2 } from 'lucide-react';

const ROLE_LABELS = {
  'locataire': '🏠 Locataire',
  'proprietaire': '🔑 Propriétaire',
  'agence': '🏢 Agence Immobilière',
} as const;

export const RoleSelector = () => {
  const { 
    activeRoles, 
    currentRole, 
    availableRoles, 
    isLoading, 
    switchRole,
    fetchActiveRoles 
  } = useRoleSwitch();

  useEffect(() => {
    fetchActiveRoles();
  }, []);

  if (!activeRoles) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des rôles</CardTitle>
        <CardDescription>
          Vous pouvez basculer entre vos différents rôles selon vos besoins
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Rôle actuel
          </Badge>
          <span className="text-lg font-semibold">
            {ROLE_LABELS[currentRole as keyof typeof ROLE_LABELS]}
          </span>
        </div>

        {availableRoles.length > 1 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Changer de rôle</label>
            <Select
              value={currentRole}
              onValueChange={switchRole}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionnez un rôle" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {ROLE_LABELS[role as keyof typeof ROLE_LABELS]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Rôles disponibles :</p>
          <div className="flex flex-wrap gap-2">
            {availableRoles.map((role) => (
              <Badge 
                key={role} 
                variant={role === currentRole ? "default" : "outline"}
              >
                {ROLE_LABELS[role as keyof typeof ROLE_LABELS]}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
