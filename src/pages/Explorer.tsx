import { lazy, Suspense } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Map } from "lucide-react";

// Lazy load des composants lourds
const ExploreMap = lazy(() => import("@/components/ExploreMap"));
const FeaturedProperties = lazy(() => import("@/components/FeaturedProperties"));

const Explorer = () => {
  return (
    <MainLayout>
      {/* Page Header unifié avec design ivoirien */}
      <PageHeader
        title="Explorer les biens"
        description="Découvrez tous nos biens immobiliers vérifiés à travers la Côte d'Ivoire"
        badge="Exploration interactive"
        icon={<Map className="h-10 w-10" />}
      />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Carte interactive */}
          <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg mb-16" />}>
            <div className="mb-16 animate-fade-in">
              <ExploreMap />
            </div>
          </Suspense>

          {/* Tous les biens */}
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Tous les biens disponibles
            </h2>
          </div>

          <Suspense
            fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-64 w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            }
          >
            <div className="animate-fade-in">
              <FeaturedProperties />
            </div>
          </Suspense>
        </div>
      </main>
    </MainLayout>
  );
};

export default Explorer;

