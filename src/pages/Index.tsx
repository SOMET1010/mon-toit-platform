import { MainLayout } from "@/components/layout/MainLayout";
import { DynamicHeroSection } from "@/components/home/DynamicHeroSection";
import { TimelineSection } from "@/components/home/TimelineSection";
import { SocialProofSection } from "@/components/home/SocialProofSection";
import { ComplianceSection } from "@/components/home/ComplianceSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { PropertyGrid } from "@/components/PropertyGrid";
import OnboardingModal from "@/components/OnboardingModal";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Search, ShieldCheck } from "lucide-react";

const Index = () => {
  console.log('[Index] Rendering Index page with new Ivorian design');
  return (
    <MainLayout>
      <Helmet>
        <title>Mon Toit - Location Immobilière Certifiée ANSUT en Côte d'Ivoire</title>
        <meta 
          name="description" 
          content="Trouvez votre logement idéal en Côte d'Ivoire. Baux certifiés ANSUT, dossiers vérifiés, signature électronique. Plus de 3,500 logements à Abidjan, Yopougon, Cocody." 
        />
        <link rel="canonical" href="https://montoit.ci" />
      </Helmet>

      <main role="main">
        {/* Hero avec sélecteur de rôle dynamique */}
        <DynamicHeroSection />
        
        {/* Timeline 6 étapes */}
        <TimelineSection />
        
        {/* KPI et preuves sociales */}
        <SocialProofSection />
        
        {/* Section fonctionnalités avec certification ANSUT */}
        <FeaturesSection />
        
        {/* Bandeau conformité */}
        <ComplianceSection />
        
        {/* Main Property Grid - Biens disponibles */}
        <PropertyGrid
          limit={16}
          showFilters={true}
        />
        
        {/* Section témoignages avec illustration famille */}
        <TestimonialsSection />

        {/* Mini CTA - Subtle, non-intrusive */}
        <section className="py-8 bg-gradient-to-b from-primary/5 to-background border-t border-primary/10">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 text-foreground">
                Pas encore trouvé votre toit idéal ?
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Explorez plus de biens ou découvrez pourquoi 10 000+ Ivoiriens nous font confiance
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Button asChild size="lg" className="shadow-md min-w-[200px]">
                  <Link to="/explorer">
                    <Search className="h-4 w-4 mr-2" />
                    Explorer plus de biens
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="shadow-sm min-w-[200px]">
                  <Link to="/a-propos">
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Pourquoi Mon Toit ?
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <OnboardingModal />
    </MainLayout>
  );
};

export default Index;

