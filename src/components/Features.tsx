import { ShieldCheck, Users, FileSignature, TrendingUp, CheckCircle, X, Award, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { memo } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import monToitLogo from "@/assets/mon-toit-logo.png";

// Types
interface KPI {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  microKpi: string;
  target: "locataire" | "proprietaire" | "agence" | "all";
  targetLabel: string;
  ctaText: string;
  ctaLink: string;
}

interface ComparisonItem {
  text: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Configuration des couleurs par cible
const TARGET_STYLES = {
  locataire: {
    border: "border-l-blue-600",
    iconBg: "bg-blue-600",
  },
  proprietaire: {
    border: "border-l-primary",
    iconBg: "bg-primary",
  },
  agence: {
    border: "border-l-secondary",
    iconBg: "bg-secondary",
  },
  all: {
    border: "border-l-secondary",
    iconBg: "bg-secondary",
  },
} as const;

// Data
const kpis: KPI[] = [
  {
    value: "15,000+",
    label: "Locataires certifiés",
    icon: Users,
  },
  {
    value: "98%",
    label: "Taux de satisfaction",
    icon: Award,
  },
  {
    value: "0",
    label: "Fraude détectée",
    icon: Shield,
  },
];

const features: Feature[] = [
  {
    icon: ShieldCheck,
    title: "Certification Locataire par l'ANSUT",
    description: "Vérification biométrique + scoring automatique. Démarquez-vous auprès des propriétaires",
    microKpi: "Vérification en 48h",
    target: "locataire",
    targetLabel: "Pour les locataires",
    ctaText: "En savoir plus",
    ctaLink: "/certification",
  },
  {
    icon: Users,
    title: "Candidatures Pré-Vérifiées",
    description: "Ne recevez que des locataires certifiés par l'ANSUT avec dossier complet et score de confiance",
    microKpi: "Score de confiance 0-100",
    target: "proprietaire",
    targetLabel: "Pour les propriétaires",
    ctaText: "Publier un bien",
    ctaLink: "/publier",
  },
  {
    icon: FileSignature,
    title: "Contrats Digitaux Sécurisés",
    description: "Bail électronique conforme à la loi ivoirienne + signature numérique + paiements Mobile Money",
    microKpi: "Signature en 5 min",
    target: "all",
    targetLabel: "Pour tous",
    ctaText: "Voir l'exemple",
    ctaLink: "/legal",
  },
  {
    icon: TrendingUp,
    title: "Tableau de Bord Agence",
    description: "Gérez plusieurs propriétés, suivez les paiements et générez des rapports en temps réel",
    microKpi: "Rapports en temps réel",
    target: "agence",
    targetLabel: "Pour les agences",
    ctaText: "Découvrir",
    ctaLink: "/admin",
  },
];

const withoutMonToit: ComparisonItem[] = [
  { text: "Dossiers incomplets et non vérifiés", icon: X },
  { text: "Identité des locataires non certifiée", icon: X },
  { text: "Paiements non sécurisés", icon: X },
  { text: "Pas de médiation en cas de litige", icon: X },
  { text: "Risque de fraude élevé", icon: X },
];

const withMonToit: ComparisonItem[] = [
  { text: "Vérification biométrique des locataires", icon: CheckCircle },
  { text: "Certification ANSUT (Agence Nationale du Service Universel)", icon: CheckCircle },
  { text: "Paiements Mobile Money sécurisés", icon: CheckCircle },
  { text: "Médiation professionnelle incluse", icon: CheckCircle },
  { text: "Contrats digitaux certifiés", icon: CheckCircle },
];

// Sous-composants
const KPICard = memo(({ kpi, index }: { kpi: KPI; index: number }) => {
  const Icon = kpi.icon;
  return (
    <div
      className="bg-white rounded-lg border-l-4 border-l-primary shadow-md p-6 flex items-center gap-4 hover:shadow-lg transition-all duration-300"
      role="article"
      aria-label={`${kpi.label}: ${kpi.value}`}
    >
      <div className="bg-primary/10 p-3 rounded-full" aria-hidden="true">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <p className="text-3xl font-bold text-foreground">{kpi.value}</p>
        <p className="text-sm text-muted-foreground">{kpi.label}</p>
      </div>
    </div>
  );
});
KPICard.displayName = "KPICard";

const FeatureCard = memo(({ feature, index }: { feature: Feature; index: number }) => {
  const Icon = feature.icon;
  const styles = TARGET_STYLES[feature.target];

  return (
    <article
      style={{ animationDelay: `${index * 100}ms` }}
      className={`bg-white rounded-lg border-l-4 ${styles.border} shadow-md hover:shadow-2xl hover:scale-[1.02] hover:border-l-primary transition-all duration-300 p-8 flex flex-col animate-fade-in relative overflow-hidden group`}
    >
      {/* Pattern bogolan au hover */}
      <div className="absolute inset-0 pattern-bogolan opacity-0 group-hover:opacity-[0.02] transition-opacity duration-300" aria-hidden="true" />
      
      <div className="relative z-10">
        <Badge variant="secondary" className="mb-4 self-start text-xs">
          {feature.targetLabel}
        </Badge>
        
        <div className={`${styles.iconBg} p-3 rounded-full w-fit mb-4 group-hover:scale-110 transition-transform duration-300`} aria-hidden="true">
          <Icon className="h-8 w-8 text-white" />
        </div>
        
        <h3 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
        
        <div className="mb-4">
          <Badge variant="outline" className="text-xs text-primary border-primary/30 bg-primary/5">
            ⚡ {feature.microKpi}
          </Badge>
        </div>
        
        <p className="text-muted-foreground mb-6 flex-1 leading-relaxed">{feature.description}</p>
        
        <div className="space-y-3">
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link to={feature.ctaLink}>{feature.ctaText}</Link>
          </Button>
          
          <div className="flex items-center gap-2 justify-center">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
            <span className="text-xs text-primary font-semibold">Certifié ANSUT</span>
          </div>
        </div>
      </div>
    </article>
  );
});
FeatureCard.displayName = "FeatureCard";

const ComparisonList = memo(({ items, positive = false }: { items: ComparisonItem[]; positive?: boolean }) => (
  <ul className="space-y-4" role="list">
    {items.map((item, index) => {
      const Icon = item.icon;
      const iconColor = positive ? "text-green-600" : "text-destructive";
      const textStyle = positive ? "text-foreground font-medium" : "text-muted-foreground";
      
      return (
        <li key={index} className="flex items-start gap-3">
          <Icon className={`h-5 w-5 ${iconColor} mt-0.5 flex-shrink-0`} aria-hidden="true" />
          <span className={textStyle}>{item.text}</span>
        </li>
      );
    })}
  </ul>
));
ComparisonList.displayName = "ComparisonList";

// Composant principal
const Features = () => {
  return (
    <section 
      className="py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white pattern-kita relative overflow-hidden"
      aria-labelledby="features-heading"
    >
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Header enrichi */}
        <header className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img 
              src={monToitLogo} 
              alt="Mon Toit - Plateforme de location sécurisée" 
              className="h-12 md:h-14" 
            />
            <Badge variant="default" className="bg-primary text-primary-foreground px-4 py-1.5 text-sm font-semibold">
              Certifié ANSUT
            </Badge>
          </div>
          
          <h2 
            id="features-heading" 
            className="text-4xl md:text-5xl font-bold mb-4 text-foreground tracking-tight"
          >
            L'avantage Mon Toit
          </h2>
          
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto mb-3 leading-relaxed">
            Plateforme de location sécurisée certifiée par l'ANSUT (Agence Nationale du Service Universel)
          </p>
          
          <p className="text-sm text-primary font-semibold">
            Partenaire officiel de l'ANSUT - Organisme d'État
          </p>
        </header>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16" role="region" aria-label="Indicateurs de performance">
          {kpis.map((kpi, index) => (
            <KPICard key={index} kpi={kpi} index={index} />
          ))}
        </div>

        {/* Features Cards enrichies */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>

        {/* Section comparative Sans/Avec Mon Toit */}
        <div className="max-w-5xl mx-auto mb-16">
          <h3 className="text-3xl font-bold text-center mb-10 text-foreground">
            Pourquoi Mon Toit fait la différence
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sans Mon Toit */}
            <div className="bg-gray-100 rounded-lg p-8 shadow-sm">
              <h4 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
                <X className="h-6 w-6 text-destructive" aria-hidden="true" />
                Location traditionnelle
              </h4>
              <ComparisonList items={withoutMonToit} />
            </div>

            {/* Avec Mon Toit */}
            <div className="bg-white rounded-lg p-8 shadow-lg border-2 border-primary/20 pattern-bogolan relative overflow-hidden">
              <div className="absolute inset-0 pattern-bogolan opacity-[0.03]" aria-hidden="true" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-green-600" aria-hidden="true" />
                    Avec Mon Toit
                  </h4>
                  <Badge className="bg-primary/10 text-primary border border-primary/20">
                    <ShieldCheck className="h-3 w-3 mr-1" aria-hidden="true" />
                    Certifié par ANSUT
                  </Badge>
                </div>
                <ComparisonList items={withMonToit} positive />
              </div>
            </div>
          </div>
        </div>

        {/* Footer avec CTA */}
        <div className="text-center mt-16 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-10 border border-primary/10">
          <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
            Prêt à louer en toute sécurité avec Mon Toit ?
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6 max-w-md mx-auto">
            <Button asChild size="lg" className="flex-1">
              <Link to="/verification">Certifier mon profil</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="flex-1">
              <Link to="/certification">En savoir plus</Link>
            </Button>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Conforme à la loi ivoirienne 2013-450 sur la protection des données
            </p>
            <p className="text-xs text-muted-foreground font-medium">
              En partenariat avec l'ANSUT - Agence Nationale du Service Universel
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
