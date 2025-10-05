import { Eye, Heart, FileText, TrendingUp, DollarSign, Home } from 'lucide-react';
import { StatCard } from './StatCard';

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
    { title: 'Biens totaux', value: stats.totalProperties, icon: Home },
    { title: 'Vues totales', value: stats.totalViews.toLocaleString(), icon: Eye },
    { title: 'Favoris', value: stats.totalFavorites, icon: Heart },
    { title: 'Candidatures', value: stats.totalApplications, icon: FileText },
    { title: 'Loyer moyen', value: `${stats.averageRent.toLocaleString()} FCFA`, icon: DollarSign },
    { title: "Taux d'occupation", value: `${stats.occupancyRate}%`, icon: TrendingUp },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default PropertyStats;
