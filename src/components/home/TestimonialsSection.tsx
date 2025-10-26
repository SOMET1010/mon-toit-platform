import { Star } from 'lucide-react';
import { ILLUSTRATIONS } from '@/lib/illustrations';

const testimonials = [
  {
    name: 'Kouadio Adjoua',
    role: 'Locataire à Cocody',
    rating: 5,
    text: 'Grâce à Mon Toit, j\'ai trouvé mon appartement idéal en moins d\'une semaine. La plateforme est simple, sécurisée et les biens sont vraiment vérifiés. Je recommande vivement !',
    avatar: 'KA'
  },
  {
    name: 'Yao Kouassi',
    role: 'Propriétaire à Marcory',
    rating: 5,
    text: 'En tant que propriétaire, Mon Toit m\'a permis de louer mes biens rapidement avec des locataires de confiance. La certification ANSUT rassure vraiment les deux parties.',
    avatar: 'YK'
  },
  {
    name: 'Diallo Aminata',
    role: 'Agent immobilier',
    rating: 5,
    text: 'Mon Toit a révolutionné ma façon de travailler. Le système de mandats est clair, les outils sont professionnels et mes clients sont satisfaits. C\'est un vrai plus pour mon activité.',
    avatar: 'DA'
  }
];

export function TestimonialsSection() {
  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container px-4 sm:px-6">
        {/* En-tête */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Ils nous font{' '}
            <span className="text-secondary">confiance</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Découvrez les témoignages de nos utilisateurs satisfaits à travers toute la Côte d'Ivoire.
          </p>
        </div>

        {/* Grille de témoignages */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative p-8 rounded-2xl bg-card border border-border hover:shadow-xl transition-all duration-300 group"
            >
              {/* Icône quote */}
              <div className="absolute top-6 right-6 text-primary/10 group-hover:text-primary/20 transition-colors">
                <Quote className="h-12 w-12" fill="currentColor" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                ))}
              </div>

              {/* Texte */}
              <p className="text-foreground mb-6 leading-relaxed relative z-10">
                "{testimonial.text}"
              </p>

              {/* Auteur */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-foreground">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Section image famille */}
        <div className="mt-20 p-8 md:p-12 rounded-3xl bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border border-border">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border">
                <img
                  src={ILLUSTRATIONS.realistic.happyTenantCouple}
                  alt="Couple ivoirien heureux dans leur nouveau logement"
                  className="w-full h-auto"
                />
              </div>
              {/* Éléments décoratifs */}
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-secondary/30 rounded-full blur-3xl"></div>
              <div className="absolute -top-6 -right-6 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
            </div>

            <div className="order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20">
                <Star className="h-5 w-5 text-secondary fill-secondary" />
                <span className="text-sm font-medium text-secondary">
                  98% de satisfaction
                </span>
              </div>
              
              <h3 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Plus de 5,000 familles ont trouvé leur toit
              </h3>
              
              <p className="text-lg text-muted-foreground">
                Chaque jour, des familles ivoiriennes trouvent le logement de leurs rêves 
                grâce à Mon Toit. Notre mission est de rendre l'accès au logement simple, 
                transparent et sécurisé pour tous.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-6 pt-6">
                <div className="space-y-1">
                  <div className="font-display text-4xl font-bold text-primary">
                    2,500+
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Biens disponibles
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-display text-4xl font-bold text-secondary">
                    5,000+
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Locataires satisfaits
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-display text-4xl font-bold text-accent">
                    1,200+
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Propriétaires
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-display text-4xl font-bold text-primary">
                    98%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Taux de satisfaction
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

