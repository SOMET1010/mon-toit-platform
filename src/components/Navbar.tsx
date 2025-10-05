import { Button } from "@/components/ui/button";
import { Home, User, LogOut, LayoutDashboard, Search, ShieldCheck, Building2, FileText, Shield, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import monToitLogo from "@/assets/mon-toit-logo.png";
import NotificationBell from "@/components/NotificationBell";
import CertificationNotificationBadge from "@/components/admin/CertificationNotificationBadge";
import { NavLink } from "@/components/navigation/NavLink";
import { VerificationProgress } from "@/components/navigation/VerificationProgress";
import { MobileMenu } from "@/components/navigation/MobileMenu";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const { canAccessAdminDashboard } = usePermissions();
  const location = useLocation();

  const getNavLinks = (userType: string | null | undefined) => {
    if (!userType) {
      return [
        { to: "/recherche", label: "Rechercher", icon: Search },
        { to: "/publier", label: "Publier", icon: Building2 },
      ];
    }

    if (userType === 'locataire') {
      return [
        { to: "/recherche", label: "Rechercher", icon: Search },
        { to: "/candidatures", label: "Candidatures", icon: FileText },
      ];
    }

    if (userType === 'proprietaire') {
      return [
        { to: "/recherche", label: "Rechercher", icon: Search },
        { to: "/mes-biens", label: "Mes biens", icon: Home },
        { to: "/publier", label: "Publier", icon: Building2 },
      ];
    }

    if (userType === 'agence') {
      return [
        { to: "/recherche", label: "Rechercher", icon: Search },
        { to: "/mes-biens", label: "Portefeuille", icon: Building2 },
      ];
    }

    return [
      { to: "/recherche", label: "Rechercher", icon: Search },
    ];
  };

  const navLinks = getNavLinks(profile?.user_type);

  return (<>
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src={monToitLogo} 
              alt="Mon Toit" 
              className="h-16 w-auto group-hover:scale-105 transition-smooth"
            />
            <div className="hidden sm:flex flex-col">
              <span className="text-2xl font-bold text-primary leading-tight">
                Mon Toit
              </span>
              <span className="text-xs text-secondary leading-tight">
                Propulsé par ANSUT
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                label={link.label}
                icon={link.icon}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <VerificationProgress />
                <NotificationBell />
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar>
                      <AvatarFallback>
                        {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{profile?.full_name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Tableau de bord
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profil" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Mon profil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/verification" className="cursor-pointer">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Vérification
                        {(profile?.oneci_verified || profile?.cnam_verified) && (
                          <span className="ml-auto text-xs text-green-600">✓</span>
                        )}
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  {canAccessAdminDashboard && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                          <Link to="/admin/certifications" className="cursor-pointer flex items-center">
                            <Shield className="mr-2 h-4 w-4" />
                            Admin ANSUT
                            <CertificationNotificationBadge />
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="hidden md:flex gap-2" asChild>
                  <Link to="/auth">
                    <User className="h-4 w-4" />
                    Connexion
                  </Link>
                </Button>
                <Button size="sm" className="hidden md:flex" asChild>
                  <Link to="/auth">S'inscrire</Link>
                </Button>
              </>
            )}
            
            {/* Mobile Menu */}
            <MobileMenu navLinks={navLinks} />
          </div>
        </div>
      </div>
    </nav>
    {/* Barre de couleurs identité */}
    <div className="fixed top-16 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary z-40" />
  </>);
};

export default Navbar;
