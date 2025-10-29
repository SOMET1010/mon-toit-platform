import { MainLayout } from "@/components/layout/MainLayout";
import { NewHeroSection } from "@/components/home/NewHeroSection";
import { WhyMonToitSection } from "@/components/home/WhyMonToitSection";
import { PropertyGrid } from "@/components/PropertyGrid";
import OnboardingModal from "@/components/OnboardingModal";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const NewIndex = () => {
  // Build v2.2 - Nouveau design + RPC Supabase fixes + Debug 404
  console.log('[NewIndex] Rendering new design homepage');
  
  return (
    <MainLayout>
      <Helmet>
        <title>Mon Toit - Trouvez votre logement idéal en toute confiance | Côte d'Ivoire</title>
        <meta 
          name="description" 
          content="Plateforme immobilière certifiée ANSUT. Signature électronique, paiement Mobile Money, vérification d'identité. Trouvez votre logement en Côte d'Ivoire." 
        />
        <link rel="canonical" href="https://montoit.ci" />
      </Helmet>

      <main role="main">
        {/* Hero Section avec nouveau design */}
        <NewHeroSection />
        
        {/* Section "Pourquoi Mon Toit ?" */}
        <WhyMonToitSection />
        
        {/* Section Propriétés récentes */}
        <section className="py-20 bg-[#FFF8F0]">
          <div className="container mx-auto px-4 max-w-7xl">
            {/* En-tête de section */}
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-2">
                  <span className="text-[#FF6B6B]">Propriétés</span> récentes
                </h2>
                <p className="text-lg text-gray-600">
                  Découvrez les dernières offres disponibles
                </p>
              </div>
              <Link to="/explorer">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-[#FF6B6B] text-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-white font-semibold hidden md:flex"
                >
                  Voir tout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Grille de propriétés */}
            <PropertyGrid
              limit={6}
              showFilters={false}
            />

            {/* Bouton mobile */}
            <div className="text-center mt-12 md:hidden">
              <Link to="/explorer">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-[#FF6B6B] text-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-white font-semibold w-full"
                >
                  Voir tout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Modal d'onboarding */}
        <OnboardingModal />
      </main>
    </MainLayout>
  );
};

export default NewIndex;

