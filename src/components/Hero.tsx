import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, CheckCircle2, Users, Building2, Star } from "lucide-react";
import heroImage from "@/assets/hero-slide-1.jpg";

const Hero = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/recherche?location=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/recherche');
    }
  };

  const handleQuickSearch = (location: string) => {
    navigate(`/recherche?location=${encodeURIComponent(location)}`);
  };

  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Fixed Background Image */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Trouvez votre logement avec ANSUT"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/50" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 py-20 md:py-28 max-w-7xl">
        <div className="max-w-2xl">
          {/* ANSUT Badge */}
          <div className="mb-6 inline-flex items-center gap-2 bg-primary px-4 py-2 rounded-full shadow-md">
            <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
            <span className="text-sm font-semibold text-primary-foreground uppercase tracking-wide">
              Vérifié ANSUT
            </span>
          </div>
          
          {/* Main Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground leading-tight">
            Trouvez votre logement ou louez{" "}
            <span className="text-primary">en toute sécurité</span>{" "}
            avec ANSUT
          </h1>
          
          <p className="text-lg md:text-xl text-foreground/80 mb-8 max-w-xl">
            La première plateforme de location sécurisée en Côte d'Ivoire. Certification officielle ANSUT pour locataires et propriétaires.
          </p>

          {/* Simplified Search Bar */}
          <div className="bg-background rounded-lg shadow-lg border border-border p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input 
                placeholder="Où cherchez-vous ?" 
                className="h-12 flex-1 text-base rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button 
                size="lg" 
                className="h-12 px-8 gap-2 rounded-lg font-semibold shadow-md" 
                onClick={handleSearch}
              >
                <Search className="h-5 w-5" />
                Rechercher
              </Button>
            </div>
            
            {/* Popular Searches */}
            <div className="flex flex-wrap gap-2 mt-4 items-center">
              <span className="text-sm font-medium text-muted-foreground">Recherches populaires:</span>
              {["Abidjan", "Cocody", "Marcory"].map((location) => (
                <button
                  key={location}
                  onClick={() => handleQuickSearch(location)}
                  className="text-sm px-3 py-1.5 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors font-medium"
                >
                  {location}
                </button>
              ))}
            </div>
          </div>

          {/* Social Proof Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-6 mt-8">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-5 w-5 text-primary" />
                <p className="text-2xl md:text-3xl font-bold text-foreground">12 000+</p>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">Locataires certifiés ANSUT</p>
            </div>
            
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-5 w-5 text-secondary" />
                <p className="text-2xl md:text-3xl font-bold text-foreground">3 500+</p>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">Propriétés vérifiées</p>
            </div>
            
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-5 w-5 text-secondary fill-secondary" />
                <p className="text-2xl md:text-3xl font-bold text-foreground">4.8/5</p>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">Sur 2 000+ avis</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
