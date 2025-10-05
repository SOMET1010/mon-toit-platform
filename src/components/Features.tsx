import { ShieldCheck, Users, FileSignature, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

const features = [
  {
    icon: ShieldCheck,
    title: "Certification Locataire ANSUT",
    description: "Vérification biométrique + scoring automatique. Démarquez-vous auprès des propriétaires",
    target: "locataire",
    targetLabel: "Pour les locataires",
    ctaText: "En savoir plus",
    ctaLink: "/certification",
  },
  {
    icon: Users,
    title: "Candidatures Pré-Vérifiées",
    description: "Ne recevez que des locataires certifiés ANSUT avec dossier complet et score de confiance",
    target: "proprietaire",
    targetLabel: "Pour les propriétaires",
    ctaText: "Publier un bien",
    ctaLink: "/publier",
  },
  {
    icon: FileSignature,
    title: "Contrats Digitaux Sécurisés",
    description: "Bail électronique conforme à la loi ivoirienne + signature numérique + paiements Mobile Money",
    target: "all",
    targetLabel: "Pour tous",
    ctaText: "Voir l'exemple",
    ctaLink: "/legal",
  },
  {
    icon: TrendingUp,
    title: "Tableau de Bord Agence",
    description: "Gérez plusieurs propriétés, suivez les paiements et générez des rapports en temps réel",
    target: "agence",
    targetLabel: "Pour les agences",
    ctaText: "Découvrir",
    ctaLink: "/admin",
  },
];

const Features = () => {
  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
      <div className="text-center mb-12">
          <h2 className="text-h2 mb-4">
            L'avantage ANSUT
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Des fonctionnalités uniques pour simplifier et sécuriser vos démarches immobilières
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="text-center group bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-smooth flex flex-col"
              >
                <Badge 
                  variant="secondary" 
                  className="mb-4 self-center text-xs"
                >
                  {feature.targetLabel}
                </Badge>
                <div className="relative inline-flex p-4 rounded-xl bg-gradient-primary mb-4 group-hover:shadow-primary transition-smooth self-center">
                  <Icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground mb-6 flex-1">{feature.description}</p>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to={feature.ctaLink}>{feature.ctaText}</Link>
                </Button>
              </div>
            );
          })}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            Conforme à la loi ivoirienne 2013-450 sur la protection des données
          </p>
        </div>
      </div>
    </section>
  );
};

export default Features;
