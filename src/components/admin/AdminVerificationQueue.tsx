import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Clock, User, FileText, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface VerificationWithUser {
  user_id: string;
  oneci_status: string;
  cnam_status: string;
  oneci_data: any;
  cnam_data: any;
  oneci_cni_number: string | null;
  cnam_employer: string | null;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string | null;
    email: string;
  };
}

export default function AdminVerificationQueue() {
  const [verifications, setVerifications] = useState<VerificationWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<{
    userId: string;
    type: 'oneci' | 'cnam';
    action: 'approve' | 'reject';
  } | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPendingVerifications = async () => {
    try {
      const { data, error } = await supabase
        .from('user_verifications')
        .select('user_id, oneci_status, cnam_status, oneci_data, cnam_data, oneci_cni_number, cnam_employer, created_at')
        .or('oneci_status.eq.pending_review,cnam_status.eq.pending_review')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Récupérer les profils séparément
      const userIds = data.map(v => v.user_id);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      const enrichedData = data.map(verification => {
        const profile = profilesData?.find(p => p.id === verification.user_id);
        return {
          ...verification,
          profiles: {
            full_name: profile?.full_name || 'N/A',
            avatar_url: profile?.avatar_url || null,
            email: 'user@example.com' // Placeholder
          }
        };
      });

      setVerifications(enrichedData as VerificationWithUser[]);
    } catch (error: any) {
      console.error('Erreur lors du chargement des vérifications:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les vérifications en attente',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const handleAction = async () => {
    if (!selectedVerification) return;

    setSubmitting(true);
    try {
      const functionName = selectedVerification.action === 'approve' 
        ? 'approve_verification' 
        : 'reject_verification';

      const { error } = await supabase.rpc(functionName, {
        p_user_id: selectedVerification.userId,
        p_verification_type: selectedVerification.type,
        p_review_notes: reviewNotes || null,
      });

      if (error) throw error;

      toast({
        title: selectedVerification.action === 'approve' ? 'Vérification approuvée' : 'Vérification rejetée',
        description: `La vérification ${selectedVerification.type.toUpperCase()} a été ${selectedVerification.action === 'approve' ? 'approuvée' : 'rejetée'} avec succès.`,
      });

      setSelectedVerification(null);
      setReviewNotes('');
      fetchPendingVerifications();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_review':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" /> En attente</Badge>;
      case 'verified':
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Vérifié</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Rejeté</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">File d'attente des vérifications</h2>
            <p className="text-muted-foreground">
              {verifications.length} vérification{verifications.length > 1 ? 's' : ''} en attente de validation
            </p>
          </div>
          <Button onClick={fetchPendingVerifications} variant="outline">
            Rafraîchir
          </Button>
        </div>

        {verifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64">
              <CheckCircle2 className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Aucune vérification en attente</p>
              <p className="text-sm text-muted-foreground">Toutes les vérifications ont été traitées</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {verifications.map((verification) => (
              <Card key={verification.user_id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={verification.profiles.avatar_url || undefined} />
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{verification.profiles.full_name}</CardTitle>
                        <CardDescription className="text-sm">{verification.profiles.email}</CardDescription>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(verification.created_at), 'PPp', { locale: fr })}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* ONECI Verification */}
                  {verification.oneci_status === 'pending_review' && (
                    <div className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-primary" />
                          <span className="font-semibold">Vérification ONECI</span>
                        </div>
                        {getStatusBadge(verification.oneci_status)}
                      </div>
                      
                      {verification.oneci_data && (
                        <div className="bg-muted/50 rounded p-3 space-y-1 text-sm">
                          <div><strong>CNI:</strong> {verification.oneci_cni_number}</div>
                          <div><strong>Nom:</strong> {verification.oneci_data.lastName}</div>
                          <div><strong>Prénom:</strong> {verification.oneci_data.firstName}</div>
                          <div><strong>Date de naissance:</strong> {verification.oneci_data.birthDate}</div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setSelectedVerification({ userId: verification.user_id, type: 'oneci', action: 'approve' })}
                          className="flex-1"
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Approuver
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setSelectedVerification({ userId: verification.user_id, type: 'oneci', action: 'reject' })}
                          className="flex-1"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Rejeter
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* CNAM Verification */}
                  {verification.cnam_status === 'pending_review' && (
                    <div className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <span className="font-semibold">Vérification CNAM</span>
                        </div>
                        {getStatusBadge(verification.cnam_status)}
                      </div>
                      
                      {verification.cnam_data && (
                        <div className="bg-muted/50 rounded p-3 space-y-1 text-sm">
                          <div><strong>Employeur:</strong> {verification.cnam_employer}</div>
                          <div><strong>Type de contrat:</strong> {verification.cnam_data.contractType || 'N/A'}</div>
                          <div><strong>Salaire estimé:</strong> {verification.cnam_data.estimatedSalary || 'N/A'} FCFA</div>
                          <div><strong>Statut:</strong> {verification.cnam_data.employmentStatus || 'N/A'}</div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setSelectedVerification({ userId: verification.user_id, type: 'cnam', action: 'approve' })}
                          className="flex-1"
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Approuver
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setSelectedVerification({ userId: verification.user_id, type: 'cnam', action: 'reject' })}
                          className="flex-1"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Rejeter
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialog de confirmation */}
      <Dialog open={!!selectedVerification} onOpenChange={() => setSelectedVerification(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedVerification?.action === 'approve' ? 'Approuver' : 'Rejeter'} la vérification {selectedVerification?.type.toUpperCase()}
            </DialogTitle>
            <DialogDescription>
              {selectedVerification?.action === 'approve' 
                ? 'Confirmez-vous vouloir approuver cette vérification ?'
                : 'Veuillez indiquer le motif du rejet (obligatoire).'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">
                Notes {selectedVerification?.action === 'reject' && <span className="text-destructive">*</span>}
              </Label>
              <Textarea
                id="notes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder={selectedVerification?.action === 'approve' 
                  ? 'Notes optionnelles...'
                  : 'Motif du rejet (obligatoire)...'
                }
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedVerification(null)} disabled={submitting}>
              Annuler
            </Button>
            <Button 
              onClick={handleAction} 
              disabled={submitting || (selectedVerification?.action === 'reject' && !reviewNotes.trim())}
              variant={selectedVerification?.action === 'approve' ? 'default' : 'destructive'}
            >
              {submitting ? 'Traitement...' : selectedVerification?.action === 'approve' ? 'Approuver' : 'Rejeter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
