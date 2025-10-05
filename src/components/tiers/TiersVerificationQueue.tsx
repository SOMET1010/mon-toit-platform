import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { logger } from '@/services/logger';

interface VerificationForReview {
  user_id: string;
  full_name: string;
  user_type: string;
  city: string;
  oneci_status: string;
  cnam_status: string;
  oneci_verified_at: string | null;
  cnam_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

interface TiersVerificationQueueProps {
  onUpdate?: () => void;
}

const TiersVerificationQueue = ({ onUpdate }: TiersVerificationQueueProps) => {
  const [verifications, setVerifications] = useState<VerificationForReview[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      
      // Use the secure RPC function that only returns non-sensitive data
      const { data, error } = await supabase.rpc('get_verifications_for_review');
      
      if (error) {
        logger.error('Error fetching verifications for review', { error });
        toast({
          title: "Erreur",
          description: "Impossible de charger les vérifications",
          variant: "destructive",
        });
        return;
      }
      
      setVerifications(data || []);
    } catch (error) {
      logger.error('Exception fetching verifications', { error });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Vérifié</Badge>;
      case 'pending_review':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />En attente</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejeté</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleValidate = async (userId: string, verificationType: 'oneci' | 'cnam', action: 'approve' | 'reject') => {
    try {
      const rpcFunction = action === 'approve' ? 'approve_verification' : 'reject_verification';
      const notes = action === 'reject' 
        ? prompt('Motif du rejet (obligatoire):')
        : undefined;
      
      if (action === 'reject' && !notes) {
        toast({
          title: "Rejet annulé",
          description: "Le motif du rejet est obligatoire",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.rpc(rpcFunction, {
        p_user_id: userId,
        p_verification_type: verificationType,
        p_review_notes: notes || null,
      });

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Vérification ${action === 'approve' ? 'approuvée' : 'rejetée'}`,
      });

      fetchVerifications();
      onUpdate?.();
    } catch (error) {
      logger.error('Error validating verification', { error, userId, verificationType, action });
      toast({
        title: "Erreur",
        description: "Impossible de traiter la vérification",
        variant: "destructive",
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

  if (verifications.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Aucune vérification en attente
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        🔒 <strong>Accès sécurisé</strong> : Vous ne voyez que les statuts de vérification, jamais les numéros de pièces d'identité
      </div>
      
      {verifications.map((verification) => (
        <Card key={verification.user_id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {verification.full_name}
              <Badge variant="outline">{verification.user_type}</Badge>
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              {verification.city} • Créé le {new Date(verification.created_at).toLocaleDateString('fr-FR')}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* ONECI Verification */}
            {verification.oneci_status === 'pending_review' && (
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Vérification ONECI</div>
                    <div className="text-sm text-muted-foreground">Carte Nationale d'Identité</div>
                  </div>
                  {getStatusBadge(verification.oneci_status)}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleValidate(verification.user_id, 'oneci', 'approve')}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approuver
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleValidate(verification.user_id, 'oneci', 'reject')}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Rejeter
                  </Button>
                </div>
              </div>
            )}
            
            {/* CNAM Verification */}
            {verification.cnam_status === 'pending_review' && (
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Vérification CNAM</div>
                    <div className="text-sm text-muted-foreground">Sécurité Sociale</div>
                  </div>
                  {getStatusBadge(verification.cnam_status)}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleValidate(verification.user_id, 'cnam', 'approve')}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approuver
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleValidate(verification.user_id, 'cnam', 'reject')}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Rejeter
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TiersVerificationQueue;
