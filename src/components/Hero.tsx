import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Home, DollarSign, CheckCircle2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import heroSlide1 from "@/assets/hero-slide-1.jpg";
import heroSlide2 from "@/assets/hero-slide-2.jpg";
import heroSlide3 from "@/assets/hero-slide-3.jpg";
import heroSlide4 from "@/assets/hero-slide-4.jpg";
import { PROPERTY_TYPES } from "@/constants";

const heroSlides = [
  {
    image: heroSlide1,
    title: "Immobilier en",
    highlight: "Côte d'Ivoire",
    description: "Trouvez votre logement idéal en Côte d'Ivoire. Appartements, villas, studios : des milliers de biens vérifiés par ANSUT."
  },
  {
    image: heroSlide2,
    title: "Villas de",
    highlight: "Prestige",
    description: "Découvrez nos villas d'exception avec piscine, dans les quartiers les plus prisés d'Abidjan."
  },
  {
    image: heroSlide3,
    title: "Concrétisez votre",
    highlight: "Rêve",
    description: "Des milliers de familles ont trouvé leur chez-soi avec Mon Toit. Pourquoi pas vous ?"
  },
  {
    image: heroSlide4,
    title: "Studios",
    highlight: "Modernes",
    description: "Pour jeunes professionnels : studios tout équipés dans les zones dynamiques d'Abidjan."
  }
];

const Hero = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [zone, setZone] = useState('');
  
  const autoplayPlugin = useCallback(() => 
    Autoplay({ delay: 5000, stopOnInteraction: true })
  , []);

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
      {/* Background Carousel */}
      <Carousel 
        className="absolute inset-0"
        plugins={[autoplayPlugin()]}
        opts={{ loop: true }}
      >
        <CarouselContent>
          {heroSlides.map((slide, index) => (
            <CarouselItem key={index}>
              <div className="relative w-full h-[600px]">
                <img 
                  src={slide.image} 
                  alt={`${slide.title} ${slide.highlight}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-foreground/40" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Content */}
      <div className="relative container mx-auto px-4 py-20 md:py-28">
        <div className="max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 bg-primary backdrop-blur-sm border-2 border-primary px-4 py-2 rounded-full shadow-primary">
            <CheckCircle2 className="h-5 w-5 text-primary-foreground fill-primary-foreground/50" />
            <span className="text-sm font-semibold text-primary-foreground uppercase tracking-wide">
              Vérifié ANSUT
            </span>
          </div>
          
          <Carousel 
            className="mb-6"
            plugins={[autoplayPlugin()]}
            opts={{ loop: true }}
          >
            <CarouselContent>
              {heroSlides.map((slide, index) => (
                <CarouselItem key={index}>
                  <div className="transition-all duration-700 animate-fade-in">
                    <h1 className="text-h1 mb-6 text-background">
                      {slide.title}{" "}
                      <span className="bg-gradient-primary bg-clip-text text-transparent">
                        {slide.highlight}
                      </span>
                    </h1>
                    <p className="text-body-lg text-background/95 mb-8 max-w-3xl">
                      {slide.description}
                    </p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

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

              <Button 
                size="xl" 
                className="w-full gap-2 h-14 rounded-xl text-base font-semibold bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-transform" 
                onClick={handleSearch}
              >
                <Search className="h-5 w-5" />
                Lancer la recherche
              </Button>
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
