import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LayoutDashboard, User, LogOut, ShieldCheck, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavLink {
  to: string;
  label: string;
  icon: LucideIcon;
}

interface MobileMenuProps {
  navLinks: NavLink[];
}

export const MobileMenu = ({ navLinks }: MobileMenuProps) => {
  const { user, profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const handleNavClick = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] overflow-y-auto">
        <div className="flex flex-col gap-6 mt-8">
          {/* Navigation principale */}
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold text-muted-foreground px-3 mb-2">NAVIGATION</p>
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                    "text-sm font-medium text-foreground/80",
                    "hover:bg-accent hover:text-foreground",
                    "transition-colors"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {user && (
            <>
              {/* Profil & Compte */}
              <div className="border-t border-border pt-4 flex flex-col gap-1">
                <p className="text-xs font-semibold text-muted-foreground px-3 mb-2">COMPTE</p>
                
                <Link
                  to="/dashboard"
                  onClick={handleNavClick}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                >
                  <LayoutDashboard className="h-5 w-5 text-primary" />
                  <span>Tableau de bord</span>
                </Link>

                <Link
                  to="/profil"
                  onClick={handleNavClick}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                >
                  <User className="h-5 w-5 text-primary" />
                  <span>Mon profil</span>
                </Link>

                <Link
                  to="/verification"
                  onClick={handleNavClick}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                >
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <span>Vérification</span>
                  {(profile?.oneci_verified || profile?.cnam_verified) && (
                    <span className="ml-auto text-xs text-green-600 font-semibold">✓</span>
                  )}
                </Link>

                {(profile?.user_type === 'proprietaire' || profile?.user_type === 'agence') && (
                  <Link
                    to="/mes-biens"
                    onClick={handleNavClick}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                  >
                    <Home className="h-5 w-5 text-primary" />
                    <span>Mes biens</span>
                  </Link>
                )}
              </div>

              {/* Déconnexion */}
              <div className="border-t border-border pt-4">
                <Button
                  variant="outline"
                  className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    signOut();
                    setOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </Button>
              </div>
            </>
          )}

          {!user && (
            <div className="border-t border-border pt-4 flex flex-col gap-3">
              <Button variant="outline" className="w-full gap-2" asChild>
                <Link to="/auth" onClick={handleNavClick}>
                  <User className="h-4 w-4" />
                  Connexion
                </Link>
              </Button>
              <Button className="w-full gap-2" asChild>
                <Link to="/auth" onClick={handleNavClick}>
                  <Home className="h-4 w-4" />
                  Créer mon compte
                </Link>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
