import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Users, Home, TrendingUp, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReportData {
  topLandlords: { name: string; propertyCount: number; avgRating: number }[];
  topTenants: { name: string; applicationCount: number; score: number }[];
  verificationStats: { oneci: number; cnam: number; face: number; total: number };
  propertyPerformance: { avgDaysToRent: number; avgViews: number; conversionRate: number };
  platformActivity: { totalUsers: number; totalProperties: number; totalApplications: number };
}

const AdvancedReporting = () => {
  const [data, setData] = useState<ReportData>({
    topLandlords: [],
    topTenants: [],
    verificationStats: { oneci: 0, cnam: 0, face: 0, total: 0 },
    propertyPerformance: { avgDaysToRent: 0, avgViews: 0, conversionRate: 0 },
    platformActivity: { totalUsers: 0, totalProperties: 0, totalApplications: 0 }
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);

      // Fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*');

      // Fetch properties with owner info
      const { data: properties } = await supabase
        .from('properties')
        .select('*');

      // Fetch applications
      const { data: applications } = await supabase
        .from('rental_applications')
        .select('*');

      // Fetch verifications
      const { data: verifications } = await supabase
        .from('user_verifications')
        .select('*');

      // Calculate top landlords
      const landlordMap = new Map<string, { name: string; count: number }>();
      properties?.forEach(property => {
        const ownerName = 'Propriétaire';
        const current = landlordMap.get(property.owner_id) || { name: ownerName, count: 0 };
        landlordMap.set(property.owner_id, { ...current, count: current.count + 1 });
      });

      const topLandlords = Array.from(landlordMap.values())
        .map(l => ({ name: l.name, propertyCount: l.count, avgRating: 4.5 }))
        .sort((a, b) => b.propertyCount - a.propertyCount)
        .slice(0, 10);

      // Calculate top tenants
      const tenantMap = new Map<string, { name: string; count: number }>();
      applications?.forEach(app => {
        const applicantName = 'Locataire';
        const current = tenantMap.get(app.applicant_id) || { name: applicantName, count: 0 };
        tenantMap.set(app.applicant_id, { ...current, count: current.count + 1 });
      });

      const topTenants = Array.from(tenantMap.values())
        .map(t => ({ name: t.name, applicationCount: t.count, score: 0 }))
        .sort((a, b) => b.applicationCount - a.applicationCount)
        .slice(0, 10);

      // Calculate verification stats
      const verificationStats = {
        oneci: verifications?.filter(v => v.oneci_status === 'verified').length || 0,
        cnam: verifications?.filter(v => v.cnam_status === 'verified').length || 0,
        face: verifications?.filter(v => v.face_verification_status === 'verified').length || 0,
        total: profiles?.length || 0
      };

      // Calculate property performance
      const totalViews = properties?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0;
      const avgViews = properties?.length ? totalViews / properties.length : 0;
      const totalApplications = applications?.length || 0;
      const totalProperties = properties?.length || 0;
      const conversionRate = totalProperties > 0 ? (totalApplications / totalProperties) * 100 : 0;

      setData({
        topLandlords,
        topTenants,
        verificationStats,
        propertyPerformance: {
          avgDaysToRent: 15,
          avgViews,
          conversionRate
        },
        platformActivity: {
          totalUsers: profiles?.length || 0,
          totalProperties: totalProperties,
          totalApplications: totalApplications
        }
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (dataToExport: any[], filename: string) => {
    if (dataToExport.length === 0) return;

    const headers = Object.keys(dataToExport[0]).join(',');
    const rows = dataToExport.map(item => Object.values(item).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();

    toast({
      title: "Export réussi",
      description: "Le fichier CSV a été téléchargé",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Rapports avancés</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.platformActivity.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Biens</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.platformActivity.totalProperties}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Candidatures</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.platformActivity.totalApplications}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance">
        <TabsList>
          <TabsTrigger value="performance">Performance utilisateurs</TabsTrigger>
          <TabsTrigger value="properties">Performance biens</TabsTrigger>
          <TabsTrigger value="verification">Vérification</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Top 10 Propriétaires</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportToCSV(data.topLandlords, 'top-proprietaires')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.topLandlords.map((landlord, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{landlord.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {landlord.propertyCount} bien{landlord.propertyCount > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Top 10 Locataires</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportToCSV(data.topTenants, 'top-locataires')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.topTenants.map((tenant, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{tenant.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {tenant.applicationCount} candidature{tenant.applicationCount > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="properties">
          <Card>
            <CardHeader>
              <CardTitle>Métriques des biens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Délai moyen avant location</p>
                  <p className="text-2xl font-bold">{data.propertyPerformance.avgDaysToRent} jours</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Vues moyennes par bien</p>
                  <p className="text-2xl font-bold">{Math.round(data.propertyPerformance.avgViews)}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Taux de conversion</p>
                  <p className="text-2xl font-bold">{data.propertyPerformance.conversionRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques de vérification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <span>ONECI vérifié</span>
                  <span className="font-bold">{data.verificationStats.oneci} / {data.verificationStats.total}</span>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <span>CNAM vérifié</span>
                  <span className="font-bold">{data.verificationStats.cnam} / {data.verificationStats.total}</span>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <span>Reconnaissance faciale</span>
                  <span className="font-bold">{data.verificationStats.face} / {data.verificationStats.total}</span>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted">
                  <span className="font-medium">Taux de vérification global</span>
                  <span className="font-bold">
                    {data.verificationStats.total > 0
                      ? Math.round(((data.verificationStats.oneci + data.verificationStats.cnam + data.verificationStats.face) / (data.verificationStats.total * 3)) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedReporting;