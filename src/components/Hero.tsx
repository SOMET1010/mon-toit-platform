import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Immobilier en Côte d'Ivoire" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-foreground/40" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-background">
            Trouvez votre{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              logement idéal
            </span>
            {" "}en Côte d'Ivoire
          </h1>
          <p className="text-lg md:text-xl text-background/90 mb-8">
            La plateforme de confiance pour louer ou publier des biens immobiliers en toute sécurité
          </p>

          {/* Search Bar */}
          <div className="bg-background rounded-xl shadow-card p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Ville, quartier..." 
                  className="pl-10 h-12"
                />
              </div>
              <div className="flex-1">
                <Input 
                  placeholder="Type de bien (Appartement, Villa...)" 
                  className="h-12"
                />
              </div>
              <Button size="xl" variant="hero" className="md:w-auto">
                <Search className="h-5 w-5" />
                Rechercher
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-sm text-muted-foreground">Recherches populaires:</span>
              {["Abidjan", "Cocody", "Appartement 2 pièces", "Villa à louer"].map((tag) => (
                <button
                  key={tag}
                  className="text-xs px-3 py-1 rounded-full bg-muted hover:bg-muted/80 text-foreground transition-smooth"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
