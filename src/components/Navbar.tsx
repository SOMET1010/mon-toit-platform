import { Button } from "@/components/ui/button";
import { Home, Menu, User, LogOut, LayoutDashboard, Heart, Search, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import monToitLogo from "@/assets/mon-toit-logo.png";

const Navbar = () => {
  const { user, profile, signOut } = useAuth();

  const navLinks = [
    { to: "/recherche", label: "Rechercher", icon: Search },
    { to: "/publier", label: "Publier une annonce" },
    { to: "/a-propos", label: "À propos" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src={monToitLogo} 
              alt="Mon Toit" 
              className="h-10 w-auto group-hover:scale-105 transition-smooth"
            />
            <div className="hidden sm:flex flex-col">
              <span className="text-lg font-bold text-foreground leading-tight">
                Mon Toit
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight">
                Propulsé par ANSUT
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.to}
                to={link.to} 
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
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
                    <Link to="/favoris" className="cursor-pointer">
                      <Heart className="mr-2 h-4 w-4" />
                      Mes favoris
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/verification" className="cursor-pointer">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Vérification d'identité
                      {(profile?.oneci_verified || profile?.cnam_verified) && (
                        <span className="ml-auto text-xs text-green-600">✓</span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  {(profile?.user_type === 'proprietaire' || profile?.user_type === 'agence') && (
                    <DropdownMenuItem asChild>
                      <Link to="/mes-biens" className="cursor-pointer">
                        <Home className="mr-2 h-4 w-4" />
                        Mes biens
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <div className="flex flex-col gap-6 mt-8">
                  <div className="flex flex-col gap-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className="text-base font-medium text-foreground/80 hover:text-foreground transition-smooth px-2 py-2"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-border pt-6 flex flex-col gap-3">
                    {user ? (
                      <>
                        <Button variant="outline" className="w-full gap-2" asChild>
                          <Link to="/dashboard">
                            <LayoutDashboard className="h-4 w-4" />
                            Tableau de bord
                          </Link>
                        </Button>
                        <Button variant="outline" className="w-full gap-2" asChild>
                          <Link to="/profil">
                            <User className="h-4 w-4" />
                            Mon profil
                          </Link>
                        </Button>
                        <Button variant="outline" className="w-full gap-2" asChild>
                          <Link to="/favoris">
                            <Heart className="h-4 w-4" />
                            Mes favoris
                          </Link>
                        </Button>
                        <Button variant="outline" className="w-full gap-2" asChild>
                          <Link to="/verification">
                            <ShieldCheck className="h-4 w-4" />
                            Vérification
                            {(profile?.oneci_verified || profile?.cnam_verified) && (
                              <span className="ml-auto text-xs text-green-600">✓</span>
                            )}
                          </Link>
                        </Button>
                        {(profile?.user_type === 'proprietaire' || profile?.user_type === 'agence') && (
                          <Button variant="outline" className="w-full gap-2" asChild>
                            <Link to="/mes-biens">
                              <Home className="h-4 w-4" />
                              Mes biens
                            </Link>
                          </Button>
                        )}
                        <Button variant="destructive" className="w-full gap-2" onClick={signOut}>
                          <LogOut className="h-4 w-4" />
                          Déconnexion
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" className="w-full gap-2" asChild>
                          <Link to="/auth">
                            <User className="h-4 w-4" />
                            Connexion
                          </Link>
                        </Button>
                        <Button className="w-full gap-2" asChild>
                          <Link to="/auth">
                            <Home className="h-4 w-4" />
                            Créer mon compte
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
