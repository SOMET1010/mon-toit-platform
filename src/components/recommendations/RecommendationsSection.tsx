import { useRecommendations } from '@/hooks/useRecommendations';
import { RecommendationCard } from './RecommendationCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface RecommendationsSectionProps {
  userId: string;
  type: 'properties' | 'tenants';
  propertyId?: string;
  limit?: number;
  title?: string;
}

export const RecommendationsSection = ({
  userId,
  type,
  propertyId,
  limit = 5,
  title,
}: RecommendationsSectionProps) => {
  const { recommendations, loading, refetch } = useRecommendations({
    type,
    propertyId,
    limit,
  });

  const [scrollPosition, setScrollPosition] = useState(0);

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('recommendations-scroll');
    if (container) {
      const scrollAmount = 320;
      const newPosition = direction === 'left' 
        ? scrollPosition - scrollAmount 
        : scrollPosition + scrollAmount;
      container.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(limit)].map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  if (!recommendations.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {title || (type === 'properties' ? '🎯 Recommandations pour vous' : '⭐ Locataires recommandés')}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('left')}
            disabled={scrollPosition <= 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={refetch}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      <div 
        id="recommendations-scroll"
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {recommendations.map((rec) => (
          <div key={rec.id} className="flex-none w-80">
            <RecommendationCard
              item={rec}
              type={type === 'properties' ? 'property' : 'tenant'}
              score={rec.score}
              reasons={rec.reasons}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
