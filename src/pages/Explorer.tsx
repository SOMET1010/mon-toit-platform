import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ExploreMap from "@/components/ExploreMap";
import FeaturedProperties from "@/components/FeaturedProperties";

const Explorer = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-h1 mb-4">
                Explorez les biens <span className="text-primary">disponibles</span>
              </h1>
              <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto">
                Découvrez tous nos biens immobiliers certifiés à travers la Côte d'Ivoire
              </p>
            </div>

            {/* Carte interactive */}
            <div className="mb-16">
              <ExploreMap />
            </div>

            {/* Tous les biens */}
            <FeaturedProperties />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Explorer;
