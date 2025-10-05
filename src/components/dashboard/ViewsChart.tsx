import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ViewsChartProps {
  data: Array<{
    date: string;
    views: number;
    favorites: number;
  }>;
}

const ViewsChart = ({ data }: ViewsChartProps) => {
  const [period, setPeriod] = useState<'7d' | '30d' | '3m' | '1y'>('30d');
  const [showViews, setShowViews] = useState(true);
  const [showFavorites, setShowFavorites] = useState(true);

  const periods = [
    { value: '7d', label: '7j' },
    { value: '30d', label: '30j' },
    { value: '3m', label: '3 mois' },
    { value: '1y', label: '1 an' },
  ] as const;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Évolution des Vues et Favoris</CardTitle>
            <CardDescription>Statistiques des {period === '7d' ? '7 derniers jours' : period === '30d' ? '30 derniers jours' : period === '3m' ? '3 derniers mois' : 'dernière année'}</CardDescription>
          </div>
          <div className="flex gap-2">
            {periods.map((p) => (
              <Button
                key={p.value}
                variant={period === p.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod(p.value)}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend 
              onClick={(e) => {
                if (e.dataKey === 'views') setShowViews(!showViews);
                if (e.dataKey === 'favorites') setShowFavorites(!showFavorites);
              }}
              wrapperStyle={{ cursor: 'pointer' }}
            />
            {showViews && (
              <Line 
                type="monotone" 
                dataKey="views" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Vues"
                dot={{ fill: 'hsl(var(--primary))' }}
                activeDot={{ r: 6 }}
              />
            )}
            {showFavorites && (
              <Line 
                type="monotone" 
                dataKey="favorites" 
                stroke="hsl(var(--destructive))" 
                strokeWidth={2}
                name="Favoris"
                dot={{ fill: 'hsl(var(--destructive))' }}
                activeDot={{ r: 6 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ViewsChart;
