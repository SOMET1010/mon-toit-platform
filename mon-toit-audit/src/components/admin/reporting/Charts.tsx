import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface ChartsProps {
  timelineData?: ChartData[];
  citiesData?: ChartData[];
  propertyTypes?: ChartData[];
}

const CHART_COLORS = {
  primary: 'hsl(30 100% 50%)',
  secondary: 'hsl(225 80% 33%)',
  success: 'hsl(142 76% 36%)',
  warning: 'hsl(38 92% 50%)',
  muted: 'hsl(220 15% 62%)',
};

const COLORS = [CHART_COLORS.primary, CHART_COLORS.secondary, CHART_COLORS.success, CHART_COLORS.warning];

export const Charts = ({ timelineData, citiesData, propertyTypes }: ChartsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Timeline Chart */}
      {timelineData && timelineData.length > 0 && (
        <div className="col-span-full">
          <h3 className="text-lg font-semibold mb-4">Évolution Temporelle</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="applications" stroke={CHART_COLORS.primary} name="Demandes" />
              <Line type="monotone" dataKey="properties" stroke={CHART_COLORS.secondary} name="Propriétés" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Cities Bar Chart */}
      {citiesData && citiesData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Répartition par Ville</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={citiesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="city" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill={CHART_COLORS.primary} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Property Types Pie Chart */}
      {propertyTypes && propertyTypes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Types de Propriétés</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={propertyTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {propertyTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export { Charts };