import { User, Home, Building2, ShieldCheck, FileCheck, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

const journeys = [
  {
    icon: User,
    title: "Locataire",
    color: "from-blue-500 to-blue-600",
    steps: [
      {
        number: "1",
        icon: User,
        title: "Créez votre profil",
        description: "Inscrivez-vous et complétez vos informations personnelles"
      },
      {
        number: "2",
        icon: ShieldCheck,
        title: "Faites-vous certifier ANSUT",
        description: "Vérification biométrique et constitution de votre dossier digital"
      },
      {
        number: "3",
        icon: FileCheck,
        title: "Postulez en 1 clic",
        description: "Candidatez aux biens avec votre profil certifié"
      }
    ],
    cta: {
      text: "Créer mon profil locataire",
      link: "/auth?type=tenant"
    }
  },
  {
    icon: Home,
    title: "Propriétaire",
    color: "from-primary to-primary-600",
    steps: [
      {
        number: "1",
        icon: Home,
        title: "Publiez votre bien",
        description: "Ajoutez photos, description et caractéristiques"
      },
      {
        number: "2",
        icon: User,
        title: "Recevez des candidatures certifiées",
        description: "Ne traitez que des dossiers vérifiés avec scoring"
      },
      {
        number: "3",
        icon: Wallet,
        title: "Signez & encaissez en ligne",
        description: "Bail digital + paiements Mobile Money sécurisés"
      }
    ],
    cta: {
      text: "Publier un bien",
      link: "/publier"
    }
  },
  {
    icon: Building2,
    title: "Agence",
    color: "from-secondary to-secondary-600",
    steps: [
      {
        number: "1",
        icon: Building2,
        title: "Créez votre profil d'agence",
        description: "Inscription professionnelle avec documents officiels"
      },
      {
        number: "2",
        icon: Home,
        title: "Gérez plusieurs propriétés",
        description: "Tableau de bord centralisé pour tous vos biens"
      },
      {
        number: "3",
        icon: FileCheck,
        title: "Signez des contrats digitaux",
        description: "Automatisez la gestion locative de A à Z"
      }
    ],
    cta: {
      text: "Créer mon compte agence",
      link: "/auth?type=agency"
    }
  }
];

const HowItWorks = () => {
  return (
    <section className="py-20 md:py-28 bg-gradient-section-primary relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-h2 mb-4">Comment ça marche ?</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choisissez votre parcours et découvrez comment Mon Toit simplifie vos démarches immobilières
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {journeys.map((journey, journeyIndex) => {
            const JourneyIcon = journey.icon;
            return (
              <div
                key={journeyIndex}
                className="group relative overflow-hidden bg-gradient-card rounded-2xl p-8 shadow-soft hover:shadow-elevated transition-all duration-500 border border-primary/10 hover:border-primary/30 hover:scale-[1.02]"
              >
                {/* Shine effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                {/* Header */}
                <div className="text-center mb-8">
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${journey.color} mb-4`}>
                    <JourneyIcon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">{journey.title}</h3>
                </div>

                {/* Steps */}
                <div className="space-y-6 mb-8">
                  {journey.steps.map((step, stepIndex) => {
                    const StepIcon = step.icon;
                    return (
                      <div key={stepIndex} className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${journey.color} flex items-center justify-center text-white font-bold`}>
                            {step.number}
                          </div>
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="flex items-center gap-2 mb-1">
                            <StepIcon className="h-4 w-4 text-primary" />
                            <h4 className="font-semibold text-sm">{step.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* CTA */}
                <Button asChild className="w-full" size="lg">
                  <Link to={journey.cta.link}>{journey.cta.text}</Link>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
