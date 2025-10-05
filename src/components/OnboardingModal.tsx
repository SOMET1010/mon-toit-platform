import { useState, useEffect } from "react";
import { Home, User, Building2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

const OnboardingModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("onboarding_seen");
    if (!hasSeenOnboarding) {
      // Délai de 1 seconde pour laisser la page se charger
      setTimeout(() => {
        setIsOpen(true);
      }, 1000);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("onboarding_seen", "true");
    setIsOpen(false);
  };

  const handleChoice = () => {
    localStorage.setItem("onboarding_seen", "true");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Home className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <DialogTitle className="text-2xl">Bienvenue sur Mon Toit</DialogTitle>
                <DialogDescription className="text-base">
                  Propulsé par ANSUT - Plateforme certifiée de location immobilière
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Vous êtes ...</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Locataire */}
              <Link
                to="/auth?type=tenant"
                onClick={handleChoice}
                className="group bg-card border-2 border-border hover:border-primary rounded-xl p-6 transition-smooth hover:shadow-lg"
              >
                <div className="text-center">
                  <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 mb-4">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">Locataire</h4>
                  <p className="text-sm text-muted-foreground">
                    Trouvez votre logement idéal et faites-vous certifier ANSUT
                  </p>
                </div>
              </Link>

              {/* Propriétaire */}
              <Link
                to="/auth?type=owner"
                onClick={handleChoice}
                className="group bg-card border-2 border-border hover:border-primary rounded-xl p-6 transition-smooth hover:shadow-lg"
              >
                <div className="text-center">
                  <div className="inline-flex p-4 rounded-xl bg-gradient-primary mb-4">
                    <Home className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">Propriétaire</h4>
                  <p className="text-sm text-muted-foreground">
                    Publiez vos biens et recevez des candidatures certifiées
                  </p>
                </div>
              </Link>

              {/* Agence */}
              <Link
                to="/auth?type=agency"
                onClick={handleChoice}
                className="group bg-card border-2 border-border hover:border-primary rounded-xl p-6 transition-smooth hover:shadow-lg"
              >
                <div className="text-center">
                  <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-secondary to-secondary-600 mb-4">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">Agence</h4>
                  <p className="text-sm text-muted-foreground">
                    Gérez plusieurs propriétés avec des outils professionnels
                  </p>
                </div>
              </Link>
            </div>
          </div>

          <div className="border-t pt-4">
            <Button
              variant="ghost"
              className="w-full"
              onClick={handleClose}
            >
              Explorer sans compte
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
