import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/services/logger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Download, Users, Home, TrendingUp, DollarSign, FileText, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { subDays } from 'date-fns';

// Components imports
import { ReportMetrics, type Metric } from './reporting/ReportMetrics';
import { Charts } from './reporting/Charts';
import { DateRangeFilter } from './reporting/DateRangeFilter';

interface ReportData {
  topLandlords: { name: string; propertyCount: number; avgRating: number }[];
  topTenants: { name: string; applicationCount: number; score: number }[];
  verificationStats: { oneci: number; cnam: number; face: number; total: number };
  propertyPerformance: { avgDaysToRent: number; avgViews: number; conversionRate: number };
  platformActivity: { totalUsers: number; totalProperties: number; totalApplications: number };
  financialData?: {
    totalRevenue: number;
    ansutCommission: number;
    revenueByType: Record<string, number>;
    activeLeases: number;
  };
  chartData?: {
    timeline: { date: string; applications: number; properties: number }[];
    citiesData: { city: string; count: number }[];
    propertyTypes: { type: string; count: number }[];
  };
  previousPeriod?: {
    totalUsers: number;
    totalProperties: number;
    totalApplications: number;
  };
}

export const AdvancedReporting = () => {
  const [data, setData] = useState<ReportData>({
    topLandlords: [],
    topTenants: [],
    verificationStats: { oneci: 0, cnam: 0, face: 0, total: 0 },
    propertyPerformance: { avgDaysToRent: 0, avgViews: 0, conversionRate: 0 },
    platformActivity: { totalUsers: 0, totalProperties: 0, totalApplications: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [periodPreset, setPeriodPreset] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');
  const { toast } = useToast();

  // Initialize default date range
  useEffect(() => {
    const end = new Date();
    const start = subDays(end, 30);
    setStartDate(start);
    setEndDate(end);
  }, []);

  // Fetch data when date range changes
  useEffect(() => {
    if (startDate && endDate) {
      fetchReportData();
    }
  }, [startDate, endDate]);

  const handleDateRangeChange = useCallback((start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  }, []);

  const handlePresetChange = useCallback((preset: '7d' | '30d' | '90d' | 'custom') => {
    setPeriodPreset(preset);
    if (preset !== 'custom') {
      const end = new Date();
      const start = subDays(end, preset === '7d' ? 7 : preset === '30d' ? 30 : 90);
      setStartDate(start);
      setEndDate(end);
    }
  }, []);

  const fetchReportData = async () => {
    if (!startDate || !endDate) return;
    
    try {
      setLoading(true);

      // Parallel data fetching for better performance
      const [profilesRes, propertiesRes, applicationsRes] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('properties').select('*').gte('created_at', startDate.toISOString()),
        supabase.from('applications').select('*').gte('created_at', startDate.toISOString())
      ]);

      const profiles = profilesRes.data || [];
      const properties = propertiesRes.data || [];
      const applications = applicationsRes.data || [];

      // Calculate metrics
      const platformActivity = {
        totalUsers: profiles.length,
        totalProperties: properties.length,
        totalApplications: applications.length
      };

      // Build chart data
      const chartData = {
        timeline: generateTimelineData(applications, properties),
        citiesData: generateCitiesData(properties),
        propertyTypes: generatePropertyTypesData(properties)
      };

      // Generate metrics for the metrics component
      const metrics: Metric[] = [
        {
          title: 'Utilisateurs Total',
          value: platformActivity.totalUsers,
          change: calculateChange(platformActivity.totalUsers, data.previousPeriod?.totalUsers),
          changeType: 'increase',
          icon: <Users className="h-4 w-4 text-muted-foreground" />
        },
        {
          title: 'Propriétés',
          value: platformActivity.totalProperties,
          change: calculateChange(platformActivity.totalProperties, data.previousPeriod?.totalProperties),
          changeType: 'increase',
          icon: <Home className="h-4 w-4 text-muted-foreground" />
        },
        {
          title: 'Demandes',
          value: platformActivity.totalApplications,
          change: calculateChange(platformActivity.totalApplications, data.previousPeriod?.totalApplications),
          changeType: 'increase',
          icon: <FileText className="h-4 w-4 text-muted-foreground" />
        },
        {
          title: 'Taux de Conversion',
          value: `${platformActivity.totalProperties > 0 ? ((platformActivity.totalApplications / platformActivity.totalProperties) * 100).toFixed(1) : 0}%`,
          icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />
        }
      ];

      setData({
        ...data,
        platformActivity,
        chartData,
        metrics
      });

    } catch (error) {
      logger.error('Error fetching report data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du rapport",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const generateTimelineData = (applications: any[], properties: any[]) => {
    const timeline = [];
    const days = 30;
    const today = new Date();

    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayApplications = applications.filter(app => 
        app.created_at.startsWith(dateStr)
      ).length;
      
      const dayProperties = properties.filter(prop => 
        prop.created_at.startsWith(dateStr)
      ).length;

      timeline.push({
        date: dateStr,
        applications: dayApplications,
        properties: dayProperties
      });
    }

    return timeline;
  };

  const generateCitiesData = (properties: any[]) => {
    const cityCounts = properties.reduce((acc, prop) => {
      const city = prop.city || 'Non spécifié';
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(cityCounts).map(([city, count]) => ({
      city,
      count: count as number
    }));
  };

  const generatePropertyTypesData = (properties: any[]) => {
    const typeCounts = properties.reduce((acc, prop) => {
      const type = prop.property_type || 'Non spécifié';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(typeCounts).map(([type, count]) => ({
      name: type,
      count: count as number
    }));
  };

  const calculateChange = (current: number, previous?: number): number | undefined => {
    if (!previous) return undefined;
    return Math.round(((current - previous) / previous) * 100);
  };

  const exportData = async () => {
    try {
      // Create CSV data
      const csvData = [
        ['Métrique', 'Valeur'],
        ['Utilisateurs Total', data.platformActivity.totalUsers],
        ['Propriétés', data.platformActivity.totalProperties],
        ['Demandes', data.platformActivity.totalApplications]
      ];

      const csv = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rapport-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Export réussi",
        description: "Le rapport a été exporté avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter le rapport",
        variant: "destructive",
      });
    }
  };

  // Prepare metrics data
  const metrics: Metric[] = [
    {
      title: 'Utilisateurs Total',
      value: data.platformActivity.totalUsers,
      icon: <Users className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: 'Propriétés',
      value: data.platformActivity.totalProperties,
      icon: <Home className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: 'Demandes',
      value: data.platformActivity.totalApplications,
      icon: <FileText className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: 'Taux de Conversion',
      value: `${data.platformActivity.totalProperties > 0 ? ((data.platformActivity.totalApplications / data.platformActivity.totalProperties) * 100).toFixed(1) : 0}%`,
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filters and export */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rapports Avancés</h1>
          <p className="text-muted-foreground">
            Analyse détaillée de l'activité de la plateforme
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onDateRangeChange={handleDateRangeChange}
            onPresetChange={handlePresetChange}
            periodPreset={periodPreset}
          />
          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <ReportMetrics metrics={metrics} />

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Charts
            timelineData={data.chartData?.timeline}
            citiesData={data.chartData?.citiesData}
            propertyTypes={data.chartData?.propertyTypes}
          />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Temps Moyen de Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.propertyPerformance.avgDaysToRent} jours</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Vues Moyennes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.propertyPerformance.avgViews}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Taux de Conversion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.propertyPerformance.conversionRate}%</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Propriétaires</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.topLandlords.slice(0, 5).map((landlord, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{landlord.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {landlord.propertyCount} propriétés
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {landlord.avgRating.toFixed(1)} ⭐
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Locataires</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.topTenants.slice(0, 5).map((tenant, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{tenant.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {tenant.applicationCount} demandes
                        </p>
                      </div>
                      <Badge variant="secondary">
                        Score: {tenant.score}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};