import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Heart, Users, TrendingUp, Home, DollarSign } from 'lucide-react';

interface PropertyStatsProps {
  stats: {
    totalProperties: number;
    totalViews: number;
    totalFavorites: number;
    totalApplications: number;
    averageRent: number;
    occupancyRate: number;
  };
}

const PropertyStats = ({ stats }: PropertyStatsProps) => {
  const statCards = [
    {
      title: 'Total Biens',
      value: stats.totalProperties,
      icon: Home,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Vues Totales',
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Favoris',
      value: stats.totalFavorites.toLocaleString(),
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Candidatures',
      value: stats.totalApplications,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Loyer Moyen',
      value: `${stats.averageRent.toLocaleString()} FCFA`,
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Taux d\'Occupation',
      value: `${stats.occupancyRate}%`,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`${stat.bgColor} p-2 rounded-lg`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PropertyStats;
