import { ShieldCheck, FileCheck, Video, Lock, Headphones, TrendingUp, Loader2 } from 'lucide-react';
import { useHighlightedFeatures } from '@/hooks/useFeatures';
import * as LucideIcons from 'lucide-react';

// Fonction pour obtenir l'icône Lucide dynamiquement
const getIcon = (iconName: string) => {
  const Icon = (LucideIcons as any)[iconName];
  return Icon || ShieldCheck; // Fallback si l'icône n'existe pas
};

// Fonction pour obtenir la couleur selon l'index
const getColor = (index: number) => {
  const colors = ['text-primary', 'text-secondary', 'text-accent'];
  return colors[index % colors.length];
};

export function FeaturesSection() {
  const { data: features, isLoading, isError } = useHighlightedFeatures();

  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container px-4 sm:px-6">
        {/* En-tête */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Pourquoi choisir{' '}
            <span className="text-primary">Mon Toit</span> ?
          </h2>
          <p className="text-lg text-muted-foreground">
            La première plateforme immobilière certifiée par l'État ivoirien. 
            Nous garantissons sécurité, transparence et simplicité pour tous vos projets immobiliers.
          </p>
        </div>

        {/* Grille de fonctionnalités */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {isError && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Impossible de charger les fonctionnalités. Veuillez réessayer plus tard.</p>
          </div>
        )}

        {!isLoading && !isError && features && features.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = getIcon(feature.icon);
            const color = getColor(index);
            return (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-xl transition-all duration-300"
              >
                <div className={`inline-flex p-4 rounded-xl bg-muted/50 mb-6 ${color} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
        )}

        {/* Section certification avec illustration */}
        <div className="mt-20 p-8 md:p-12 rounded-3xl bg-gradient-to-br from-muted/50 to-background border border-border">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Certification Officielle
                </span>
              </div>
              
              <h3 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Certifié par l'ANSUT
              </h3>
              
              <p className="text-lg text-muted-foreground">
                Mon Toit est la première et unique plateforme immobilière certifiée par 
                l'Autorité Nationale de Sécurisation des Transactions Urbaines (ANSUT). 
                Cette certification garantit la légalité, la sécurité et la transparence 
                de toutes les transactions effectuées sur notre plateforme.
              </p>
              
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                  <span className="text-foreground">Vérification d'identité obligatoire pour tous les utilisateurs</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-secondary"></div>
                  </div>
                  <span className="text-foreground">Validation des titres de propriété par l'ANSUT</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-accent"></div>
                  </div>
                  <span className="text-foreground">Contrats de location conformes à la législation ivoirienne</span>
                </li>
              </ul>
            </div>
            
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border">
                <img
                  src="/illustration_certification.png"
                  alt="Certification ANSUT - Professionnel avec certificat"
                  className="w-full h-auto"
                />
              </div>
              {/* Éléments décoratifs */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent/30 rounded-full blur-3xl"></div>
              <div className="absolute -top-6 -left-6 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

