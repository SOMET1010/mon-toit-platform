import { MainLayout } from "@/components/layout/MainLayout";
import { DynamicHeroSection } from "@/components/home/DynamicHeroSection";
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
        
        {/* Biens disponibles - Limité à 8 pour éviter le scroll */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Biens disponibles
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Découvrez notre sélection de logements vérifiés
              </p>
            </div>
            <PropertyGrid
              limit={8}
              showFilters={false}
            />
            <div className="text-center mt-8">
              <Link to="/properties">
                <Button size="lg" variant="outline">
                  Voir tous les biens
                  <Search className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-16 bg-gradient-to-r from-orange-500 via-orange-400 to-green-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Vous voulez en savoir plus ?
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Découvrez comment Mon Toit simplifie la location immobilière en Côte d'Ivoire
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/explorer">
                <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 min-w-[220px]">
                  Explorer les biens
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 min-w-[220px]">
                  Créer mon compte
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <OnboardingModal />
    </MainLayout>
  );
};

export default Index;

