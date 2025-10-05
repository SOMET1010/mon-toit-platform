import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Clock, CheckCircle } from "lucide-react";

interface CertificationStats {
  total: number;
  certified: number;
  pending: number;
  rejected: number;
  in_review: number;
  avg_processing_time: number;
}

export const CertificationStats = () => {
  const [stats, setStats] = useState<CertificationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: leases, error } = await supabase
        .from('leases')
        .select('certification_status, certification_requested_at, ansut_certified_at');

      if (error) throw error;

      const certifiedLeases = leases?.filter(l => l.certification_status === 'certified') || [];
      const processingTimes = certifiedLeases
        .filter(l => l.certification_requested_at && l.ansut_certified_at)
        .map(l => {
          const requested = new Date(l.certification_requested_at!).getTime();
          const certified = new Date(l.ansut_certified_at!).getTime();
          return (certified - requested) / (1000 * 60 * 60 * 24);
        });

      const avgTime = processingTimes.length > 0
        ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length
        : 0;

      setStats({
        total: leases?.length || 0,
        certified: leases?.filter(l => l.certification_status === 'certified').length || 0,
        pending: leases?.filter(l => l.certification_status === 'pending').length || 0,
        rejected: leases?.filter(l => l.certification_status === 'rejected').length || 0,
        in_review: leases?.filter(l => l.certification_status === 'in_review').length || 0,
        avg_processing_time: Math.round(avgTime * 10) / 10
      });
    } catch (error) {
      console.error('Erreur stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[60px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total baux</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Certifiés</CardTitle>
          <CheckCircle className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">{stats.certified}</div>
          <p className="text-xs text-muted-foreground">
            {stats.total > 0 ? `${Math.round((stats.certified / stats.total) * 100)}% du total` : '0%'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">En attente</CardTitle>
          <Clock className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-warning">{stats.pending + stats.in_review}</div>
          <p className="text-xs text-muted-foreground">
            {stats.pending} demandes + {stats.in_review} en révision
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Temps moyen</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.avg_processing_time}j</div>
          <p className="text-xs text-muted-foreground">Traitement certification</p>
        </CardContent>
      </Card>
    </div>
  );
};