import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Users, 
  TrendingUp, 
  Download,
  Shield,
  Award,
  Percent
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VerificationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  avg_confidence_score: number;
  avg_processing_time_hours: number;
  approval_rate: number;
}

export const AdminVerificationStats = () => {
  const [stats, setStats] = useState<VerificationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: verifications, error } = await supabase
        .from('smile_id_verifications')
        .select('*');

      if (error) throw error;

      if (!verifications || verifications.length === 0) {
        setStats({
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          avg_confidence_score: 0,
          avg_processing_time_hours: 0,
          approval_rate: 0
        });
        return;
      }

      const pending = verifications.filter(v => v.status === 'pending').length;
      const approved = verifications.filter(v => v.status === 'approved').length;
      const rejected = verifications.filter(v => v.status === 'rejected').length;

      // Calculate average confidence score
      const avgConfidence = verifications.reduce((sum, v) => sum + (v.confidence_score || 0), 0) / verifications.length;

      // Calculate average processing time
      const reviewedVerifications = verifications.filter(v => v.reviewed_at);
      let avgProcessingTime = 0;
      if (reviewedVerifications.length > 0) {
        const totalTime = reviewedVerifications.reduce((sum, v) => {
          const created = new Date(v.created_at).getTime();
          const reviewed = new Date(v.reviewed_at!).getTime();
          return sum + (reviewed - created);
        }, 0);
        avgProcessingTime = totalTime / reviewedVerifications.length / (1000 * 60 * 60); // Convert to hours
      }

      // Calculate approval rate
      const totalReviewed = approved + rejected;
      const approvalRate = totalReviewed > 0 ? (approved / totalReviewed) * 100 : 0;

      setStats({
        total: verifications.length,
        pending,
        approved,
        rejected,
        avg_confidence_score: avgConfidence,
        avg_processing_time_hours: avgProcessingTime,
        approval_rate: approvalRate
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async () => {
    try {
      const { data: verifications, error } = await supabase
        .from('smile_id_verifications')
        .select(`
          *,
          user_profile:profiles!user_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!verifications || verifications.length === 0) {
        toast({
          title: "Aucune donnée",
          description: "Aucune vérification à exporter",
          variant: "destructive"
        });
        return;
      }

      // Create CSV content
      const headers = [
        'Date',
        'Nom',
        'Email',
        'Statut',
        'Score de confiance',
        'Résultat',
        'Job ID',
        'Date de révision',
        'Notes'
      ];

      const rows = verifications.map(v => [
        new Date(v.created_at).toLocaleDateString('fr-FR'),
        v.user_profile?.full_name || 'N/A',
        v.user_profile?.email || 'N/A',
        v.status,
        `${(v.confidence_score * 100).toFixed(1)}%`,
        v.result_text,
        v.smile_job_id,
        v.reviewed_at ? new Date(v.reviewed_at).toLocaleDateString('fr-FR') : 'N/A',
        v.review_notes || ''
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `verifications_smile_id_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export réussi",
        description: `${verifications.length} vérifications exportées`
      });
    } catch (error) {
      console.error('Error exporting:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'exporter les données",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Shield className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Aucune statistique disponible</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Export Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Statistiques Smile ID</h3>
          <p className="text-muted-foreground">
            Aperçu des vérifications d'identité
          </p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exporter CSV
        </Button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Vérifications totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              À examiner
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approuvées</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">
              Certifications accordées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejetées</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">
              Vérifications refusées
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score moyen</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.avg_confidence_score * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Confiance Smile ID moyenne
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps de traitement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avg_processing_time_hours.toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground">
              Délai moyen de révision
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'approbation</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.approval_rate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Vérifications approuvées
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

