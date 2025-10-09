import { Button } from "@/components/ui/button";
import { User, LogOut, LayoutDashboard, ShieldCheck, Shield, Search, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
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
import { Badge } from "@/components/ui/badge";
import monToitLogo from "@/assets/mon-toit-logo.png";
import NotificationBell from "@/components/NotificationBell";
import CertificationNotificationBadge from "@/components/admin/CertificationNotificationBadge";
import { VerificationProgress } from "@/components/navigation/VerificationProgress";
import { MobileMenu } from "@/components/navigation/MobileMenu";
import { RoleSwitcherCompact } from "@/components/navigation/RoleSwitcherCompact";

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const { canAccessAdminDashboard } = usePermissions();

  return (<>
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
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

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/recherche" 
              className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              <Search className="h-4 w-4" />
              <span>Rechercher</span>
            </Link>
            <Link 
              to="/publier" 
              className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Publier</span>
            </Link>
            <Link 
              to="/verification" 
              className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Certification ANSUT</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">Gratuit</Badge>
            </Link>
            <Link 
              to="/#comment-ca-marche" 
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              Comment ça marche
            </Link>
            <Link 
              to="/tarifs" 
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              Tarifs
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden md:block">
                  <VerificationProgress />
                </div>
                <RoleSwitcherCompact />
                <NotificationBell />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar>
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 bg-background border border-border shadow-lg">
                    <DropdownMenuLabel className="pb-2">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold text-foreground">{profile?.full_name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        {(profile?.oneci_verified || profile?.cnam_verified) && (
                          <Badge variant="outline" className="w-fit mt-1 text-xs border-primary text-primary">
                            ✓ Certifié ANSUT
                          </Badge>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuGroup>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="cursor-pointer flex items-center">
                          <LayoutDashboard className="mr-3 h-4 w-4 text-primary" />
                          <span>Tableau de bord</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/profil" className="cursor-pointer flex items-center">
                          <User className="mr-3 h-4 w-4 text-primary" />
                          <span>Mon profil</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/verification" className="cursor-pointer flex items-center">
                          <ShieldCheck className="mr-3 h-4 w-4 text-primary" />
                          <span>Vérification</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>

                    {canAccessAdminDashboard && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem asChild>
                            <Link to="/admin" className="cursor-pointer flex items-center">
                              <Shield className="mr-3 h-4 w-4 text-primary" />
                              <span>Admin Dashboard</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/admin/certifications" className="cursor-pointer flex items-center">
                              <Shield className="mr-3 h-4 w-4 text-primary" />
                              <span>Certifications ANSUT</span>
                              <CertificationNotificationBadge />
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive focus:text-destructive">
                      <LogOut className="mr-3 h-4 w-4" />
                      <span>Déconnexion</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button 
                size="sm" 
                className="hidden md:flex" 
                asChild
              >
                <Link to="/auth">Créer un compte / Se connecter</Link>
              </Button>
            )}
            
            {/* Mobile Menu */}
            <MobileMenu />
          </div>
        </div>
      </div>
    </nav>
    {/* Barre de couleurs identité */}
    <div className="fixed top-16 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary z-40" />
  </>);
};

export default Navbar;
