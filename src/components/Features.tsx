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
    <section className="py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            L'avantage ANSUT
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Des fonctionnalités uniques pour simplifier et sécuriser vos démarches immobilières
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            
            // Couleur border gauche selon le target
            const borderColor = 
              feature.target === "locataire" ? "border-l-blue-600" : 
              feature.target === "proprietaire" ? "border-l-primary" : 
              "border-l-secondary";
            
            // Couleur fond icône
            const iconBgColor = 
              feature.target === "locataire" ? "bg-blue-600" : 
              feature.target === "proprietaire" ? "bg-primary" : 
              "bg-secondary";
            
            return (
              <div
                key={index}
                className={`bg-white rounded-lg border-l-4 ${borderColor} shadow-md hover:shadow-xl hover:border-l-primary transition-all duration-300 p-8 flex flex-col`}
              >
                <Badge 
                  variant="secondary" 
                  className="mb-4 self-start text-xs"
                >
                  {feature.targetLabel}
                </Badge>
                <div className={`${iconBgColor} p-3 rounded-full w-fit mb-4`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground mb-6 flex-1 leading-relaxed">{feature.description}</p>
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
