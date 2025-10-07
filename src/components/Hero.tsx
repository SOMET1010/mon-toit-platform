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
    <section className="relative min-h-[700px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-white via-primary/5 to-secondary/5 pattern-bogolan">
      {/* Fixed Background Image - Right Side */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden lg:block">
        <img 
          src={heroImage} 
          alt="Famille heureuse avec ANSUT"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 py-20 md:py-28 max-w-7xl z-10">
        <div className="max-w-2xl lg:max-w-xl">
          {/* Badge Gratuit */}
          <div className="inline-flex items-center gap-2 bg-secondary/10 border-2 border-secondary px-4 py-2 rounded-full mb-6">
            <CheckCircle2 className="h-5 w-5 text-secondary" />
            <span className="text-sm font-bold text-secondary uppercase tracking-wide">
              100% Gratuit pour locataires
            </span>
          </div>

          {/* Small decorative line */}
          <div className="mb-6 w-20 h-1 bg-gradient-to-r from-primary to-secondary rounded-full" />
          
          {/* Main Title - Bold and Large */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-foreground leading-tight uppercase tracking-tight">
            Trouvez votre logement ou louez{" "}
            <span className="block mt-2">en toute sécurité</span>{" "}
            <span className="block mt-2">avec Mon Toit</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl font-medium">
            Gratuit pour les locataires, sécurisé pour tous. La première plateforme de location certifiée en Côte d'Ivoire.
          </p>

          {/* Primary CTA Button */}
          <div className="mb-10">
            <Button 
              size="lg" 
              className="h-14 px-10 text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 bg-secondary hover:bg-secondary/90 text-white rounded-full"
              onClick={() => navigate('/recherche')}
            >
              <Search className="h-5 w-5 mr-2" />
              Rechercher un logement
            </Button>
          </div>

          {/* Note ANSUT */}
          <div className="flex items-center gap-2 mb-8 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-secondary" />
            <span>✨ Service financé par l'ANSUT</span>
          </div>

          {/* Social Proof Stats - White Cards */}
          <div className="grid grid-cols-3 gap-4 md:gap-6">
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-primary/10 hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col items-center text-center">
                <Users className="h-8 w-8 md:h-10 md:w-10 text-primary mb-2" />
                <p className="text-2xl md:text-3xl font-black text-foreground">12 000+</p>
                <p className="text-xs md:text-sm text-muted-foreground font-medium mt-1">
                  locataires certifiés
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-secondary/10 hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col items-center text-center">
                <Building2 className="h-8 w-8 md:h-10 md:w-10 text-secondary mb-2" />
                <p className="text-2xl md:text-3xl font-black text-foreground">3 500+</p>
                <p className="text-xs md:text-sm text-muted-foreground font-medium mt-1">
                  logements vérifiés
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-secondary/10 hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col items-center text-center">
                <Star className="h-8 w-8 md:h-10 md:w-10 text-secondary fill-secondary mb-2" />
                <p className="text-2xl md:text-3xl font-black text-foreground">4,8/5</p>
                <p className="text-xs md:text-sm text-muted-foreground font-medium mt-1">
                  Sur 200+ avis
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
