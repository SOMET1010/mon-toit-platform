import { Star, Quote, MapPin, ShieldCheck, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";
import { LazyIllustration } from "@/components/illustrations/LazyIllustration";
import { getIllustrationPath } from "@/lib/utils";
import { useFeaturedTestimonials } from "@/hooks/useTestimonials";
import { Loader2 } from "lucide-react";

// Fonction utilitaire pour générer les initiales
const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// Fonction pour générer un gradient aléatoire cohérent
const getGradient = (index: number) => {
  const gradients = [
    "bg-gradient-to-br from-blue-600 to-blue-700",
    "bg-gradient-to-br from-primary to-orange-600",
    "bg-gradient-to-br from-primary to-primary",
    "bg-gradient-to-br from-green-600 to-green-700",
    "bg-gradient-to-br from-purple-600 to-purple-700",
  ];
  return gradients[index % gradients.length];
};

const Testimonials = () => {
  const { data: testimonials, isLoading, isError } = useFeaturedTestimonials();
  const autoplayPlugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Bannière illustration */}
        <div className="mb-12">
          <div className="relative h-64 rounded-2xl overflow-hidden shadow-xl">
            <LazyIllustration 
              src={getIllustrationPath('key-handover')!}
              alt="Remise de clés réussie"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center">
              <div className="text-white p-8 max-w-xl">
                <h2 className="text-3xl md:text-4xl font-bold mb-2">Ils ont trouvé leur toit</h2>
                <p className="text-lg opacity-90">Des milliers de locataires satisfaits grâce à Mon Toit</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Témoignages</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Découvrez les témoignages de notre communauté d'utilisateurs satisfaits
          </p>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {isError && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Impossible de charger les témoignages. Veuillez réessayer plus tard.</p>
          </div>
        )}

        {!isLoading && !isError && testimonials && testimonials.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 sm:px-12">
          <Carousel
            opts={{
              align: "center",
              loop: true,
            }}
            plugins={[autoplayPlugin.current]}
            className="w-full"
          >
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index}>
                  <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-lg p-8 md:p-12 shadow-lg border border-primary/10 relative transition-all duration-250 ease-in-out hover:shadow-xl hover:scale-[1.02] cursor-pointer">
                    <Quote className="absolute top-6 right-6 h-12 w-12 text-primary/10" />
                    
                    {/* Badge Certifié ANSUT */}
                    {testimonial.rating === 5 && (
                      <div className="absolute top-6 left-6 inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full text-xs font-semibold">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Certifié ANSUT
                      </div>
                    )}
                    
                    {/* Rating */}
                    <div className={`flex gap-1 ${testimonial.rating === 5 ? 'mt-8' : ''} mb-6`}>
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                      ))}
                    </div>

                    {/* Content */}
                    <p className="text-lg md:text-xl text-foreground leading-relaxed mb-8 relative z-10">
                      "{testimonial.quote}"
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-full ${getGradient(index)} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                        {testimonial.photo_url ? (
                          <img src={testimonial.photo_url} alt={testimonial.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          getInitials(testimonial.name)
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role || testimonial.profession}</div>
                        {testimonial.location && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {testimonial.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>
        )}

        {/* Footer CTA simplifié */}
        <div className="max-w-4xl mx-auto mt-16 text-center">
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button asChild size="lg" variant="default">
              <Link to="/auth">Rejoindre la communauté</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/certification">En savoir plus</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
