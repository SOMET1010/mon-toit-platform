import { Shield, FileCheck, MessageSquare, Wallet, Lock } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Sécurité garantie",
    description: "Vérification d'identité et transactions sécurisées pour votre tranquillité d'esprit",
    badge: true,
  },
  {
    icon: FileCheck,
    title: "Dossier locatif digital",
    description: "Constituez et gérez votre dossier locatif en ligne simplement",
  },
  {
    icon: MessageSquare,
    title: "Messagerie intégrée",
    description: "Échangez directement avec les propriétaires en toute sécurité",
  },
  {
    icon: Wallet,
    title: "Paiement en ligne",
    description: "Payez vos loyers via Mobile Money (Orange, MTN, Moov) ou carte bancaire",
  },
];

const Features = () => {
  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-h2 mb-4">
            Pourquoi choisir Mon Toit ?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Une plateforme moderne et sécurisée pour simplifier vos démarches immobilières
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="text-center group bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-smooth"
              >
                <div className="relative inline-flex p-4 rounded-xl bg-gradient-primary mb-4 group-hover:shadow-primary transition-smooth">
                  <Icon className="h-8 w-8 text-primary-foreground" />
                  {feature.badge && (
                    <div className="absolute -top-1 -right-1">
                      <Lock className="h-5 w-5 text-secondary fill-secondary/20" />
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
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
