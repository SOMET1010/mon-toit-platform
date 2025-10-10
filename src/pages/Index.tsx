import { lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import ContextBar from "@/components/ContextBar";
import Hero from "@/components/Hero";
import KeyStats from "@/components/KeyStats";
import Footer from "@/components/Footer";
import StickyCTA from "@/components/StickyCTA";
import OnboardingModal from "@/components/OnboardingModal";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load des composants lourds
const FeaturedProperties = lazy(() => import("@/components/FeaturedProperties"));
const PreFooterCTA = lazy(() => import("@/components/PreFooterCTA"));

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header role="banner">
        <Navbar />
        <ContextBar />
      </header>
      
      <main role="main" className="flex-1">
        <section aria-labelledby="hero-heading">
          <Hero />
        
        </section>
        
        <section aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="sr-only">Statistiques de la plateforme</h2>
          <div className="animate-fade-in">
            <KeyStats />
          </div>
        </section>
        
        <section aria-labelledby="featured-heading">
          <h2 id="featured-heading" className="sr-only">Biens en vedette</h2>
          <Suspense fallback={
          <div className="container mx-auto px-4 py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        }>
            <div className="animate-fade-in">
              <FeaturedProperties limit={4} />
            </div>
          </Suspense>
        </section>
        
        <section aria-labelledby="cta-heading">
          <h2 id="cta-heading" className="sr-only">Appel à l'action</h2>
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <div className="animate-fade-in">
              <PreFooterCTA />
            </div>
          </Suspense>
        </section>
      </main>
      
      <footer role="contentinfo">
        <Footer />
      </footer>
      <StickyCTA />
      <OnboardingModal />
    </div>
  );
};

export default Index;
