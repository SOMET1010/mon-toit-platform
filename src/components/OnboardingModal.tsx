import { useState, useEffect } from "react";
import { Home, User, Building2, X, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

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
      <DialogContent className="max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Home className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Bienvenue sur Mon Toit</DialogTitle>
              <DialogDescription className="text-base">
                Plateforme certifiée ANSUT de location immobilière
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="tenant" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto bg-muted/30 backdrop-blur-sm shadow-sm border border-border mb-6">
            <TabsTrigger 
              value="tenant" 
              className="flex items-center gap-2 py-4 text-sm md:text-base data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-blue-600"
            >
              <User className="h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
              <span className="hidden sm:inline">Locataire</span>
              <span className="sm:hidden">Louer</span>
            </TabsTrigger>
            <TabsTrigger 
              value="owner"
              className="flex items-center gap-2 py-4 text-sm md:text-base data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-primary"
            >
              <Home className="h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
              <span className="hidden sm:inline">Propriétaire</span>
              <span className="sm:hidden">Louer</span>
            </TabsTrigger>
            <TabsTrigger 
              value="agency"
              className="flex items-center gap-2 py-4 text-sm md:text-base data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-secondary"
            >
              <Building2 className="h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
              <span className="hidden sm:inline">Agence</span>
              <span className="sm:hidden">Pro</span>
            </TabsTrigger>
          </TabsList>

          {/* Locataire */}
          <TabsContent value="tenant" className="mt-0">
            <div className="bg-gradient-to-br from-background to-muted/20 rounded-lg border-l-4 border-l-blue-600 p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-full shrink-0">
                  <User className="h-6 w-6 md:h-8 md:w-8 text-white" aria-hidden="true" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold">Pour les Locataires</h3>
              </div>
              
              <p className="text-muted-foreground leading-relaxed">
                Trouvez votre logement idéal et démarquez-vous avec la certification ANSUT
              </p>
              
              <ul className="space-y-3" role="list">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <span>Vérification biométrique rapide en 48h</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <span>Score de confiance automatique (0-100)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <span>Candidature en 1 clic sur tous les biens</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <span>Dossier digital sécurisé et réutilisable</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <span>Protection de vos données personnelles</span>
                </li>
              </ul>
              
              <Button asChild size="lg" className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleChoice}>
                <Link to="/auth?type=tenant">
                  Créer mon profil locataire
                </Link>
              </Button>
            </div>
          </TabsContent>

          {/* Propriétaire */}
          <TabsContent value="owner" className="mt-0">
            <div className="bg-gradient-to-br from-background to-muted/20 rounded-lg border-l-4 border-l-primary p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-primary p-4 rounded-full shrink-0">
                  <Home className="h-6 w-6 md:h-8 md:w-8 text-primary-foreground" aria-hidden="true" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold">Pour les Propriétaires</h3>
              </div>
              
              <p className="text-muted-foreground leading-relaxed">
                Publiez vos biens et recevez uniquement des candidatures certifiées
              </p>
              
              <ul className="space-y-3" role="list">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <span>Candidats pré-vérifiés par l'ANSUT</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <span>Score de confiance visible pour chaque candidat</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <span>Contrats numériques certifiés légalement</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <span>Paiements sécurisés via Mobile Money</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <span>Médiation professionnelle en cas de litige</span>
                </li>
              </ul>
              
              <Button asChild size="lg" className="w-full" onClick={handleChoice}>
                <Link to="/auth?type=owner">
                  Publier mon premier bien
                </Link>
              </Button>
            </div>
          </TabsContent>

          {/* Agence */}
          <TabsContent value="agency" className="mt-0">
            <div className="bg-gradient-to-br from-background to-muted/20 rounded-lg border-l-4 border-l-secondary p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-secondary to-secondary/90 p-4 rounded-full shrink-0">
                  <Building2 className="h-6 w-6 md:h-8 md:w-8 text-white" aria-hidden="true" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold">Pour les Agences</h3>
              </div>
              
              <p className="text-muted-foreground leading-relaxed">
                Gérez plusieurs propriétés avec des outils professionnels avancés
              </p>
              
              <ul className="space-y-3" role="list">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <span>Gestion multi-propriétés centralisée</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <span>Tableau de bord analytique complet</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <span>Accès à tous les candidats certifiés ANSUT</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <span>Signature électronique de masse</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <span>Support prioritaire et formations</span>
                </li>
              </ul>
              
              <Button asChild size="lg" className="w-full bg-secondary hover:bg-secondary/90" onClick={handleChoice}>
                <Link to="/auth?type=agency">
                  Créer mon compte agence
                </Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="border-t pt-4">
          <Button
            variant="ghost"
            className="w-full"
            onClick={handleClose}
          >
            Explorer sans compte
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
