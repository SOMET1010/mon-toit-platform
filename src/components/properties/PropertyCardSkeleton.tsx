import { Card, CardHeader, CardContent } from '@/components/ui/card';

export const PropertyCardSkeleton = () => (
  <Card className="overflow-hidden">
    {/* Réserver l'espace exact des images */}
    <div className="aspect-video bg-gray-200 animate-pulse" />
    
    <CardHeader className="p-4 sm:p-6 pb-3">
      <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
      <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse" />
    </CardHeader>

    <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
      <div className="flex gap-4">
        <div className="h-10 bg-gray-200 rounded flex-1 animate-pulse" />
        <div className="h-10 bg-gray-200 rounded flex-1 animate-pulse" />
        <div className="h-10 bg-gray-200 rounded flex-1 animate-pulse" />
      </div>
      <div className="h-10 bg-gray-200 rounded animate-pulse" />
    </CardContent>
  </Card>
);
