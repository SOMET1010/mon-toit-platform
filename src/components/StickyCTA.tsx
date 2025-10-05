import { useState, useEffect } from "react";
import { Home, UserPlus, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";

const StickyCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { user, profile } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  // Si non connecté
  if (!user) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-primary to-primary-600 text-primary-foreground shadow-2xl animate-slide-in-up">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center md:text-left">
              <Home className="h-6 w-6 flex-shrink-0" />
              <div>
                <p className="font-semibold text-lg">Prêt à trouver votre toit ?</p>
                <p className="text-sm text-primary-foreground/90">Rejoignez des milliers d'utilisateurs satisfaits</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="secondary" size="lg">
                <Link to="/auth?type=tenant">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Je suis locataire
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-white/10 border-white/20 hover:bg-white/20 text-white">
                <Link to="/auth?type=owner">
                  <Home className="h-4 w-4 mr-2" />
                  Je suis proprio
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si connecté comme locataire sans certification
  if (profile?.user_type === "locataire") {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-secondary to-secondary-600 text-white shadow-2xl animate-slide-in-up">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center md:text-left">
              <ShieldCheck className="h-6 w-6 flex-shrink-0" />
              <div>
                <p className="font-semibold text-lg">Complétez votre certification ANSUT</p>
                <p className="text-sm text-white/90">Démarquez-vous et postulez en 1 clic</p>
              </div>
            </div>
            <Button asChild variant="secondary" size="lg">
              <Link to="/verification">
                Compléter mon profil
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default StickyCTA;
