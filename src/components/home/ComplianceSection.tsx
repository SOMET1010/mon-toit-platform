import { Shield, Lock, Database, FileCheck } from 'lucide-react';

const complianceItems = [
  {
    icon: Lock,
    title: 'Données protégées',
    description: 'Chiffrement de bout en bout',
  },
  {
    icon: Shield,
    title: 'RLS Supabase',
    description: 'Sécurité au niveau des lignes',
  },
  {
    icon: Database,
    title: 'Archivage 5 ans',
    description: 'Conformité légale CI',
  },
  {
    icon: FileCheck,
    title: 'Conformité RGPD',
    description: 'Protection des données',
  },
];

export function ComplianceSection() {
  return (
    <section className="py-12 bg-gradient-to-r from-gray-50 to-gray-100 border-y border-gray-200">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold mb-2">
              Sécurité & Conformité
            </h3>
            <p className="text-sm text-muted-foreground">
              Vos données sont protégées selon les standards les plus élevés
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {complianceItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="flex flex-col items-center text-center p-4 rounded-lg bg-white border border-gray-200 hover:border-primary/50 hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              );
            })}
          </div>

          {/* Additional compliance text */}
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground max-w-3xl mx-auto">
              Mon Toit respecte les normes de sécurité et de confidentialité les plus strictes. 
              Toutes les données sont hébergées en Côte d'Ivoire et conformes à la législation ivoirienne. 
              Nous utilisons des technologies certifiées par l'ANSUT pour garantir la souveraineté numérique.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

