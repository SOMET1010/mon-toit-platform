import { Button } from "@/components/ui/button";
import { Building2, Menu, User } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-gradient-primary rounded-lg group-hover:shadow-primary transition-smooth">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              ImmoCI
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/recherche" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
              Rechercher
            </Link>
            <Link to="/publier" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
              Publier une annonce
            </Link>
            <Link to="/a-propos" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
              À propos
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="hidden md:flex">
              <User className="h-4 w-4" />
              Connexion
            </Button>
            <Button size="sm">
              S'inscrire
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
