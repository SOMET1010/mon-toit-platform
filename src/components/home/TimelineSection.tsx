import { Search, MessageCircle, ShieldCheck, FileSignature, CreditCard, Wrench } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Rechercher',
    description: 'Trouvez le bien idéal',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: MessageCircle,
    title: 'Chat',
    description: 'Échangez avec le propriétaire',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    icon: ShieldCheck,
    title: 'Vérifier',
    description: 'Identité certifiée Smile ID',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    icon: FileSignature,
    title: 'Signer',
    description: 'Bail électronique PSE',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    icon: CreditCard,
    title: 'Payer',
    description: 'Mobile Money sécurisé',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
  },
  {
    icon: Wrench,
    title: 'Maintenir',
    description: 'Suivi & maintenance',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
  },
];

export function TimelineSection() {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Un processus simple en 6 étapes pour une location 100% digitale
          </p>
        </div>

        {/* Timeline horizontale */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className="group relative flex flex-col items-center text-center"
                >
                  {/* Ligne de connexion (desktop uniquement) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-gray-300 to-gray-200 z-0" />
                  )}

                  {/* Icône */}
                  <div className={`relative z-10 w-16 h-16 rounded-full ${step.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200 shadow-md`}>
                    <Icon className={`h-8 w-8 ${step.color}`} />
                  </div>

                  {/* Numéro */}
                  <div className="absolute top-0 right-0 w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center z-20">
                    {index + 1}
                  </div>

                  {/* Titre */}
                  <h3 className="font-semibold text-sm mb-1">{step.title}</h3>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground">{step.description}</p>

                  {/* Tooltip au hover (optionnel) */}
                  <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                      {step.description}
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="/comment-ca-marche"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors"
          >
            Voir la démo en 60 secondes
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

