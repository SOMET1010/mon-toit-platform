import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Home, DollarSign } from 'lucide-react';

interface Property {
  id: string;
  price: number;
  type: string;
}

interface StatsPanelProps {
  properties: Property[];
}

export function StatsPanel({ properties }: StatsPanelProps) {
  if (properties.length === 0) {
    return null;
  }

  const prices = properties.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

  const stats = [
    {
      label: 'Biens disponibles',
      value: properties.length,
      icon: Home,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Prix moyen',
      value: `${avgPrice.toLocaleString('fr-FR')} FCFA`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Prix minimum',
      value: `${minPrice.toLocaleString('fr-FR')} FCFA`,
      icon: TrendingDown,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Prix maximum',
      value: `${maxPrice.toLocaleString('fr-FR')} FCFA`,
      icon: TrendingUp,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <Card className="mt-6 bg-gradient-to-r from-orange-50 via-blue-50 to-green-50 border-none shadow-lg">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Statistiques du marché</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-white shadow-sm"
              >
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-sm font-semibold">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

