import { Star, Quote } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";

const testimonials = [
  {
    name: "Kouadio Marc",
    role: "Locataire certifié ANSUT",
    location: "Cocody, Abidjan",
    content: "J'ai trouvé mon appartement en 48h grâce à ma certification ANSUT. Les propriétaires me répondaient immédiatement car mon dossier était déjà complet et vérifié. Un gain de temps incroyable !",
    rating: 5,
    avatar: "KM"
  },
  {
    name: "Adjoua Sarah",
    role: "Propriétaire",
    location: "Marcory, Abidjan",
    content: "Fini les dossiers incomplets et les vérifications interminables. Avec Mon Toit, je ne reçois que des candidatures sérieuses et certifiées. Le paiement Mobile Money est un vrai plus pour mes locataires.",
    rating: 5,
    avatar: "AS"
  },
  {
    name: "Immobilier Plus SARL",
    role: "Agence immobilière",
    location: "Plateau, Abidjan",
    content: "Le tableau de bord agence nous permet de gérer 50+ propriétés efficacement. Les contrats digitaux et le suivi des paiements nous font gagner des heures chaque semaine. Un outil professionnel indispensable.",
    rating: 5,
    avatar: "IP"
  }
];

const Testimonials = () => {
  const autoplayPlugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-h2 mb-4">Ils nous font confiance</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Découvrez les témoignages de notre communauté d'utilisateurs satisfaits
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[autoplayPlugin.current]}
            className="w-full"
          >
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index}>
                  <div className="bg-card rounded-2xl p-8 md:p-12 shadow-sm border border-border relative">
                    <Quote className="absolute top-6 right-6 h-12 w-12 text-primary/10" />
                    
                    {/* Rating */}
                    <div className="flex gap-1 mb-6">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                      ))}
                    </div>

                    {/* Content */}
                    <p className="text-lg md:text-xl text-foreground leading-relaxed mb-8 relative z-10">
                      "{testimonial.content}"
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-lg">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                        <div className="text-xs text-muted-foreground">{testimonial.location}</div>
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
      </div>
    </section>
  );
};

export default Testimonials;
