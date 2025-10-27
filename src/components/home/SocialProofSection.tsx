import { TrendingUp, Clock, Star, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const stats = [
  {
    icon: Users,
    value: '+2,000',
    label: 'Dossiers vérifiés',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Clock,
    value: '<24h',
    label: 'Pour signer un bail',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    icon: Star,
    value: '4.8/5',
    label: 'Satisfaction moyenne',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    icon: TrendingUp,
    value: '98%',
    label: 'Taux de succès',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
];

const testimonials = [
  {
    text: "J'ai trouvé mon appartement en 3 jours. Le processus de vérification est rapide et sécurisé.",
    author: 'Aminata K.',
    role: 'Locataire à Cocody',
    rating: 5,
  },
  {
    text: "Enfin une plateforme qui protège les propriétaires. Les dossiers sont pré-vérifiés, c'est rassurant.",
    author: 'Jean-Marc B.',
    role: 'Propriétaire à Plateau',
    rating: 5,
  },
  {
    text: "La signature électronique est un vrai gain de temps. Plus besoin de se déplacer 3 fois.",
    author: 'Fatou D.',
    role: 'Locataire à Yopougon',
    rating: 5,
  },
];

export function SocialProofSection() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* KPI Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${stat.bgColor} mb-4`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Testimonials */}
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">
            Ce que disent nos utilisateurs
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-orange-500 text-orange-500" />
                    ))}
                  </div>

                  {/* Text */}
                  <p className="text-sm text-gray-700 mb-4 italic">
                    "{testimonial.text}"
                  </p>

                  {/* Author */}
                  <div className="border-t pt-4">
                    <p className="font-semibold text-sm">{testimonial.author}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

