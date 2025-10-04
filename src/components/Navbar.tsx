import { Button } from "@/components/ui/button";
import { Home, Menu, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import monToitLogo from "@/assets/mon-toit-logo.png";

const Navbar = () => {
  const navLinks = [
    { to: "/recherche", label: "Rechercher" },
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
            <Button variant="ghost" size="sm" className="hidden md:flex gap-2">
              <User className="h-4 w-4" />
              Connexion
            </Button>
            <Button size="sm" className="hidden md:flex">
              S'inscrire
            </Button>
            
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
                    <Button variant="outline" className="w-full gap-2">
                      <User className="h-4 w-4" />
                      Connexion
                    </Button>
                    <Button className="w-full gap-2">
                      <Home className="h-4 w-4" />
                      Créer mon compte
                    </Button>
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
