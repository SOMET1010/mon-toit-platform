import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

interface VerificationData {
  oneci_status: string;
  cnam_status: string;
  oneci_verified_at: string | null;
  cnam_verified_at: string | null;
  tenant_score: number;
}

const VerificationStatus = () => {
  const { user } = useAuth();
  const [verification, setVerification] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVerification = async () => {
      if (!user) {
        console.log('✅ VerificationStatus - No user yet');
        return;
      }

      console.log('✅ VerificationStatus - Fetching verification for user:', user.id);

      const { data, error } = await supabase
        .from('user_verifications')
        .select('oneci_status, cnam_status, oneci_verified_at, cnam_verified_at, tenant_score')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('✅ VerificationStatus - Error fetching verification:', error);
      } else {
        console.log('✅ VerificationStatus - Verification data:', data);
        setVerification(data);
      }
      setLoading(false);
    };

    fetchVerification();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-600">Vérifié</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-600">En attente</Badge>;
      case 'rejected':
        return <Badge className="bg-red-600">Rejeté</Badge>;
      default:
        return <Badge variant="outline">Non soumis</Badge>;
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(verification?.oneci_status || 'pending')}
              <div>
                <h3 className="font-semibold">Vérification ONECI</h3>
                <p className="text-sm text-muted-foreground">Carte Nationale d'Identité</p>
              </div>
            </div>
            {getStatusBadge(verification?.oneci_status || 'pending')}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(verification?.cnam_status || 'pending')}
              <div>
                <h3 className="font-semibold">Vérification CNAM</h3>
                <p className="text-sm text-muted-foreground">Situation professionnelle</p>
              </div>
            </div>
            {getStatusBadge(verification?.cnam_status || 'pending')}
          </div>

          {verification?.tenant_score !== undefined && verification.tenant_score > 0 && (
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Score Locataire</span>
                <span className="text-2xl font-bold text-primary">
                  {verification.tenant_score}/100
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VerificationStatus;
