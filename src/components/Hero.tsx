import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Home } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import heroImage from "@/assets/hero-bg.jpg";
import CertifiedBadge from "@/components/ui/certified-badge";

const Hero = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [maxBudget, setMaxBudget] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (propertyType) params.set('type', propertyType);
    if (maxBudget) params.set('maxPrice', maxBudget);
    navigate(`/recherche?${params.toString()}`);
  };

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
      <div className="relative container mx-auto px-4 py-20 md:py-28">
        <div className="max-w-3xl">
          <div className="mb-6">
            <CertifiedBadge />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-background">
            Le logement,{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              en toute confiance
            </span>
          </h1>
          <p className="text-lg md:text-xl text-background/90 mb-2">
            100% ivoirien, 100% digital
          </p>
          <p className="text-base md:text-lg text-background/80 mb-8">
            Développé avec la garantie ANSUT
          </p>

          {/* Search Bar */}
          <div className="bg-background rounded-xl shadow-card p-4 md:p-6">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                  <Input 
                    placeholder="Ex. Cocody, Marcory, Zone 4..." 
                    className="pl-10 h-12"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Type de bien" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="appartement">Appartement</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="studio">Studio</SelectItem>
                      <SelectItem value="duplex">Duplex</SelectItem>
                      <SelectItem value="maison">Maison</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Input 
                    type="number"
                    placeholder="Budget max (FCFA)" 
                    className="h-12"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                  />
                </div>
                <Button size="xl" variant="hero" className="md:w-auto gap-2" onClick={handleSearch}>
                  <Search className="h-5 w-5" />
                  Rechercher
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4 items-center">
              <span className="text-sm text-muted-foreground">Recherches populaires:</span>
              {[
                { label: "Abidjan", search: "abidjan" },
                { label: "Yamoussoukro", search: "yamoussoukro" },
                { label: "Bouaké", search: "bouake" },
                { label: "Cocody", search: "cocody" },
                { label: "Marcory", search: "marcory" },
                { label: "Plateau", search: "plateau" }
              ].map((tag) => (
                <button
                  key={tag.search}
                  onClick={() => {
                    setLocation(tag.search);
                    const params = new URLSearchParams();
                    params.set('location', tag.search);
                    if (propertyType) params.set('type', propertyType);
                    if (maxBudget) params.set('maxPrice', maxBudget);
                    navigate(`/recherche?${params.toString()}`);
                  }}
                  className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground text-foreground transition-smooth"
                >
                  {tag.label}
                </button>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-border">
              <Button variant="outline" size="lg" className="w-full md:w-auto gap-2">
                <Home className="h-4 w-4" />
                Créer mon compte
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
