import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ApplicationsChartProps {
  data: Array<{
    property: string;
    pending: number;
    approved: number;
    rejected: number;
  }>;
}

const ApplicationsChart = ({ data }: ApplicationsChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Candidatures par Bien</CardTitle>
        <CardDescription>Répartition des statuts de candidatures</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="property" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              angle={-45}
              textAnchor="end"
              height={100}
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
            <Bar dataKey="pending" fill="#facc15" name="En attente" />
            <Bar dataKey="approved" fill="#22c55e" name="Approuvées" />
            <Bar dataKey="rejected" fill="#ef4444" name="Rejetées" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ApplicationsChart;
