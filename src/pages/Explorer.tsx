import { lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load des composants lourds
const ExploreMap = lazy(() => import("@/components/ExploreMap"));
const FeaturedProperties = lazy(() => import("@/components/FeaturedProperties"));

const Explorer = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <h1 className="text-h1 mb-4">
                Explorez les biens <span className="text-primary">disponibles</span>
              </h1>
              <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto">
                Découvrez tous nos biens immobiliers certifiés à travers la Côte d'Ivoire
              </p>
            </div>

            {/* Carte interactive */}
            <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg mb-16" />}>
              <div className="mb-16 animate-fade-in">
                <ExploreMap />
              </div>
            </Suspense>

            {/* Tous les biens */}
            <Suspense fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-64 w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            }>
              <div className="animate-fade-in">
                <FeaturedProperties />
              </div>
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Explorer;
