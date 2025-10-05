import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Home, DollarSign, CheckCircle2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import heroImage from "@/assets/hero-family-home.jpg";
import { PROPERTY_TYPES } from "@/constants";

const Hero = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [zone, setZone] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (propertyType) params.set('type', propertyType);
    if (priceRange) params.set('maxPrice', priceRange);
    if (zone) params.set('zone', zone);
    navigate(`/recherche?${params.toString()}`);
  };

  const handleFreeSearch = () => {
    navigate('/recherche');
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
        <div className="max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 bg-secondary/90 backdrop-blur-sm border-2 border-secondary px-4 py-2 rounded-full shadow-elegant">
            <CheckCircle2 className="h-5 w-5 text-background fill-background" />
            <span className="text-sm font-semibold text-background uppercase tracking-wide">
              Vérifié ANSUT
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-background leading-tight">
            Immobilier en{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Côte d'Ivoire
            </span>
          </h1>
          <p className="text-lg md:text-xl text-background/95 mb-8 leading-relaxed max-w-3xl">
            Confiez-nous et obtenez tous les bénéfices. Mon Toit vous offre un service complet de distribution des biens immobiliers. Des appartements modernes d'Abidjan aux villas luxueuses d'Assinie, vous trouverez votre chez-vous idéal.
          </p>

          {/* Search Bar */}
          <div className="bg-background rounded-2xl shadow-elegant p-6 md:p-8 backdrop-blur-sm">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                  <Input 
                    placeholder="Localisation" 
                    className="pl-10 h-14 rounded-xl border-2"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger className="h-14 pl-10 rounded-xl border-2">
                      <SelectValue placeholder="Prix" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100000">Moins de 100K</SelectItem>
                      <SelectItem value="200000">100K - 200K</SelectItem>
                      <SelectItem value="500000">200K - 500K</SelectItem>
                      <SelectItem value="1000000">500K - 1M</SelectItem>
                      <SelectItem value="999999999">Plus de 1M</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                  <Select value={zone} onValueChange={setZone}>
                    <SelectTrigger className="h-14 pl-10 rounded-xl border-2">
                      <SelectValue placeholder="Zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zone-4">Zone 4</SelectItem>
                      <SelectItem value="riviera">Riviera</SelectItem>
                      <SelectItem value="angre">Angré</SelectItem>
                      <SelectItem value="deux-plateaux">Deux Plateaux</SelectItem>
                      <SelectItem value="cocody">Cocody</SelectItem>
                      <SelectItem value="marcory">Marcory</SelectItem>
                      <SelectItem value="plateau">Plateau</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative">
                  <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger className="h-14 pl-10 rounded-xl border-2">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map((type) => (
                        <SelectItem key={type.toLowerCase()} value={type.toLowerCase()}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  size="xl" 
                  variant="default" 
                  className="flex-1 gap-2 h-14 rounded-xl text-base font-semibold shadow-primary hover:shadow-primary" 
                  onClick={handleSearch}
                >
                  <Search className="h-5 w-5" />
                  Rechercher un logement
                </Button>
                <Button 
                  size="xl" 
                  variant="outline" 
                  className="flex-1 gap-2 h-14 rounded-xl text-base font-semibold border-2 hover:bg-accent" 
                  onClick={handleFreeSearch}
                >
                  Rechercher gratuitement
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-6 items-center">
              <span className="text-sm font-medium text-muted-foreground">Recherches populaires:</span>
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
                    if (priceRange) params.set('maxPrice', priceRange);
                    if (zone) params.set('zone', zone);
                    navigate(`/recherche?${params.toString()}`);
                  }}
                  className="text-sm px-4 py-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground text-foreground transition-smooth font-medium"
                >
                  {tag.label}
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
