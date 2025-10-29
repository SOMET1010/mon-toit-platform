import { Shield, FileSignature, Smartphone } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const features = [
  {
    icon: Shield,
    title: 'Certification ANSUT',
    description: 'Vérification d\'identité ONECI et CNAM pour une sécurité maximale de tous nos utilisateurs',
    badge: '100% Vérifié',
    badgeColor: 'bg-green-100 text-green-700',
    iconBg: 'bg-[#6B7B5C]',
    borderColor: 'border-gray-200',
  },
  {
    icon: FileSignature,
    title: 'Signature électronique',
    description: 'Signez vos contrats de location en ligne via CryptoNeo, simple et rapide',
    badge: '100% Digital',
    badgeColor: 'bg-cyan-100 text-cyan-700',
    iconBg: 'bg-[#22D3EE]',
    borderColor: 'border-cyan-200',
  },
  {
    icon: Smartphone,
    title: 'Paiement Mobile Money',
    description: 'Payez facilement avec Orange Money, MTN Money et Moov Money',
    badge: 'Facile & Rapide',
    badgeColor: 'bg-orange-100 text-orange-700',
    iconBg: 'bg-[#FF8A65]',
    borderColor: 'border-orange-200',
  },
];

export function WhyMonToitSection() {
  return (
    <section className="py-20 bg-[#FFF8F0]">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Titre de section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Pourquoi <span className="text-[#FF6B6B]">Mon Toit</span> ?
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Un logement pour tous, accessible et sécurisé
          </p>
        </div>

        {/* Grille de cartes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className={`p-8 bg-white hover:shadow-xl transition-all duration-300 border-2 ${feature.borderColor} rounded-2xl`}
              >
                {/* Icône */}
                <div className="mb-6">
                  <div className={`w-16 h-16 ${feature.iconBg} rounded-2xl flex items-center justify-center`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                </div>

                {/* Titre */}
                <h3 className="text-2xl font-bold mb-4 text-gray-900">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>

                {/* Badge */}
                <Badge className={`${feature.badgeColor} border-0 font-semibold px-4 py-1.5`}>
                  {feature.badge}
                </Badge>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

