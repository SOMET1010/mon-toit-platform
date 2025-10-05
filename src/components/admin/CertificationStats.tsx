import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Award, Clock, CheckCircle, XCircle, FileText } from "lucide-react";

interface CertificationStats {
  total: number;
  certified: number;
  pending: number;
  in_review: number;
  rejected: number;
  avg_processing_time: number;
  approval_rate: number;
}

const CertificationStats = () => {
  const [stats, setStats] = useState<CertificationStats>({
    total: 0,
    certified: 0,
    pending: 0,
    in_review: 0,
    rejected: 0,
    avg_processing_time: 0,
    approval_rate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all leases
        const { data: leases, error } = await supabase
          .from('leases')
          .select('certification_status, certification_requested_at, ansut_certified_at');

        if (error) throw error;

        const total = leases?.length || 0;
        const certified = leases?.filter(l => l.certification_status === 'certified').length || 0;
        const pending = leases?.filter(l => l.certification_status === 'pending').length || 0;
        const in_review = leases?.filter(l => l.certification_status === 'in_review').length || 0;
        const rejected = leases?.filter(l => l.certification_status === 'rejected').length || 0;

        // Calculate average processing time
        const processedLeases = leases?.filter(l => 
          l.certification_requested_at && 
          l.ansut_certified_at &&
          l.certification_status === 'certified'
        ) || [];

        let avgTime = 0;
        if (processedLeases.length > 0) {
          const totalTime = processedLeases.reduce((sum, lease) => {
            const requested = new Date(lease.certification_requested_at!).getTime();
            const certified = new Date(lease.ansut_certified_at!).getTime();
            return sum + (certified - requested);
          }, 0);
          avgTime = totalTime / processedLeases.length / (1000 * 60 * 60 * 24); // Convert to days
        }

        const approvalRate = total > 0 ? (certified / total) * 100 : 0;

        setStats({
          total,
          certified,
          pending,
          in_review,
          rejected,
          avg_processing_time: Math.round(avgTime * 10) / 10,
          approval_rate: Math.round(approvalRate * 10) / 10,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      label: 'Total baux',
      value: stats.total,
      icon: FileText,
      color: 'text-primary',
    },
    {
      label: 'Certifiés',
      value: stats.certified,
      icon: CheckCircle,
      color: 'text-success',
    },
    {
      label: 'En attente',
      value: stats.pending,
      icon: Clock,
      color: 'text-warning',
    },
    {
      label: 'En révision',
      value: stats.in_review,
      icon: Award,
      color: 'text-info',
    },
    {
      label: 'Rejetés',
      value: stats.rejected,
      icon: XCircle,
      color: 'text-destructive',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-12 bg-muted rounded" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center gap-4">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Temps de traitement moyen</h3>
          <p className="text-3xl font-bold text-primary">
            {stats.avg_processing_time} jours
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Taux d'approbation</h3>
          <p className="text-3xl font-bold text-success">
            {stats.approval_rate}%
          </p>
        </Card>
      </div>
    </div>
  );
};

export default CertificationStats;