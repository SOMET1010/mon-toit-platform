import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ViewsChartProps {
  data: Array<{
    date: string;
    views: number;
    favorites: number;
  }>;
}

const ViewsChart = ({ data }: ViewsChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Évolution des Vues et Favoris</CardTitle>
        <CardDescription>Statistiques des 30 derniers jours</CardDescription>
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
            <Legend />
            <Line 
              type="monotone" 
              dataKey="views" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              name="Vues"
              dot={{ fill: 'hsl(var(--primary))' }}
            />
            <Line 
              type="monotone" 
              dataKey="favorites" 
              stroke="hsl(var(--destructive))" 
              strokeWidth={2}
              name="Favoris"
              dot={{ fill: 'hsl(var(--destructive))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ViewsChart;
