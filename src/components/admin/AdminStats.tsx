import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Home, Users, FileText, CheckCircle } from 'lucide-react';

const AdminStats = () => {
  const [stats, setStats] = useState({
    totalProperties: 0,
    pendingProperties: 0,
    totalUsers: 0,
    totalLeases: 0,
    certifiedLeases: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [propertiesRes, usersRes, leasesRes, certifiedRes] = await Promise.all([
        supabase.from('properties').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('leases').select('id', { count: 'exact', head: true }),
        supabase.from('leases').select('id', { count: 'exact', head: true }).not('ansut_certified_at', 'is', null),
      ]);

      const pendingProps = await supabase
        .from('properties')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'en_attente');

      setStats({
        totalProperties: propertiesRes.count || 0,
        pendingProperties: pendingProps.count || 0,
        totalUsers: usersRes.count || 0,
        totalLeases: leasesRes.count || 0,
        certifiedLeases: certifiedRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="h-20 bg-muted/50" />
            <CardContent className="h-16 bg-muted/30" />
          </Card>
        ))}
      </div>
    </div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Biens immobiliers</CardTitle>
          <Home className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalProperties}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.pendingProperties} en attente de validation
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Inscrits sur la plateforme
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Baux</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalLeases}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Total des baux
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Baux certifiés</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.certifiedLeases}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.totalLeases > 0 ? Math.round((stats.certifiedLeases / stats.totalLeases) * 100) : 0}% du total
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStats;
