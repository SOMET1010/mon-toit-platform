import { useState } from 'react';
import { useRoleSwitchV2, UserRole } from '@/hooks/useRoleSwitchV2';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RoleSwitcherV2Props {
  variant?: 'compact' | 'full';
  className?: string;
}

const roleIcons: Record<UserRole, string> = {
  locataire: '🏠',
  proprietaire: '🔑',
  agence: '🏢',
  admin_ansut: '👨‍💼'
};

const roleColors: Record<UserRole, string> = {
  locataire: 'bg-blue-100 text-blue-800 border-blue-200',
  proprietaire: 'bg-orange-100 text-orange-800 border-orange-200',
  agence: 'bg-purple-100 text-purple-800 border-purple-200',
  admin_ansut: 'bg-gray-100 text-gray-800 border-gray-200'
};

/**
 * Composant de changement de rôle V2
 * - Modal de confirmation
 * - Affichage des limites
 * - Cooldown visible
 * - Pas de rechargement de page
 */
export const RoleSwitcherV2 = ({ variant = 'compact', className = '' }: RoleSwitcherV2Props) => {
  const {
    activeRole,
    availableRoles,
    remainingSwitchesToday,
    canSwitchNow,
    remainingCooldownMinutes,
    switchRole,
    isSwitching,
    roleLabels,
  } = useRoleSwitchV2();

  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleRoleClick = (role: UserRole) => {
    if (role === activeRole) return;
    
    if (!canSwitchNow) {
      return; // Le bouton sera désactivé, mais au cas où
    }

    setSelectedRole(role);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (selectedRole) {
      switchRole(selectedRole);
      setShowConfirm(false);
      setSelectedRole(null);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setSelectedRole(null);
  };

  if (!activeRole || availableRoles.length === 0) {
    return null;
  }

  // Version compacte (pour navbar)
  if (variant === 'compact') {
    return (
      <>
        <div className={`flex items-center gap-2 ${className}`}>
          {availableRoles.map((role) => (
            <Button
              key={role}
              variant={role === activeRole ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleRoleClick(role)}
              disabled={role === activeRole || !canSwitchNow || isSwitching}
              className={role === activeRole ? roleColors[role] : ''}
            >
              {isSwitching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span className="mr-1">{roleIcons[role]}</span>
                  {roleLabels[role].split(' ')[1]}
                </>
              )}
            </Button>
          ))}
        </div>

        {/* Modal de confirmation */}
        <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedRole && roleIcons[selectedRole]}
                Passer en mode {selectedRole && roleLabels[selectedRole].split(' ')[1]} ?
              </DialogTitle>
              <DialogDescription>
                Votre interface sera adaptée en conséquence.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Changements restants aujourd'hui</span>
                  <Badge variant="secondary">
                    {remainingSwitchesToday}/3
                  </Badge>
                </div>
                
                {remainingSwitchesToday === 1 && (
                  <Alert variant="default" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Dernier changement disponible aujourd'hui
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={handleCancel} disabled={isSwitching}>
                Annuler
              </Button>
              <Button onClick={handleConfirm} disabled={isSwitching}>
                {isSwitching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Changement...
                  </>
                ) : (
                  'Confirmer'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Version complète (pour page paramètres)
  return (
    <>
      <div className={`space-y-4 ${className}`}>
        <div>
          <h3 className="text-lg font-semibold mb-2">Rôle actif</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Choisissez le rôle que vous souhaitez utiliser. Vous pouvez changer de rôle jusqu'à 3 fois par jour.
          </p>
        </div>

        {/* Affichage des limites */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {remainingSwitchesToday}/3
            </div>
            <div className="text-sm text-muted-foreground">
              Changements restants aujourd'hui
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="text-2xl font-bold text-primary flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {remainingCooldownMinutes > 0 ? `${remainingCooldownMinutes}min` : '✓'}
            </div>
            <div className="text-sm text-muted-foreground">
              {remainingCooldownMinutes > 0 ? 'Cooldown actif' : 'Prêt à changer'}
            </div>
          </div>
        </div>

        {/* Sélection des rôles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {availableRoles.map((role) => (
            <button
              key={role}
              onClick={() => handleRoleClick(role)}
              disabled={role === activeRole || !canSwitchNow || isSwitching}
              className={`
                relative p-4 border-2 rounded-lg text-left transition-all
                ${role === activeRole 
                  ? `${roleColors[role]} border-current` 
                  : 'border-border hover:border-primary hover:bg-accent'
                }
                ${!canSwitchNow && role !== activeRole ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${isSwitching ? 'opacity-50 cursor-wait' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{roleIcons[role]}</span>
                <div className="flex-1">
                  <div className="font-semibold">{roleLabels[role]}</div>
                  {role === activeRole && (
                    <Badge variant="secondary" className="mt-1">
                      Actif
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Avertissements */}
        {!canSwitchNow && remainingCooldownMinutes > 0 && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Vous devez attendre {remainingCooldownMinutes} minute{remainingCooldownMinutes > 1 ? 's' : ''} avant de pouvoir changer à nouveau de rôle.
            </AlertDescription>
          </Alert>
        )}

        {!canSwitchNow && remainingSwitchesToday === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Vous avez atteint la limite de 3 changements par jour. Réessayez demain.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Modal de confirmation (même que version compacte) */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedRole && roleIcons[selectedRole]}
              Passer en mode {selectedRole && roleLabels[selectedRole].split(' ')[1]} ?
            </DialogTitle>
            <DialogDescription>
              Votre interface sera adaptée en conséquence.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Changements restants aujourd'hui</span>
                <Badge variant="secondary">
                  {remainingSwitchesToday}/3
                </Badge>
              </div>
              
              {remainingSwitchesToday === 1 && (
                <Alert variant="default" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Dernier changement disponible aujourd'hui
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={isSwitching}>
              Annuler
            </Button>
            <Button onClick={handleConfirm} disabled={isSwitching}>
              {isSwitching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changement...
                </>
              ) : (
                'Confirmer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

