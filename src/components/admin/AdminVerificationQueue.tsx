import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, XCircle, Clock, User, Shield, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type VerificationStatus = 'pending' | 'approved' | 'rejected';

interface SmileIDVerification {
  id: string;
  user_id: string;
  status: VerificationStatus;
  smile_job_id: string;
  confidence_score: number;
  result_code: string;
  result_text: string;
  selfie_image_url: string | null;
  id_image_url: string | null;
  full_response: any;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  review_notes: string | null;
  user_profile?: {
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
}

export default function AdminVerificationQueue() {
  const [verifications, setVerifications] = useState<SmileIDVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<SmileIDVerification | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<VerificationStatus>('pending');

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      
      // Fetch Smile ID verifications with user profiles
      const { data, error } = await supabase
        .from('smile_id_verifications')
        .select(`
          *,
          user_profile:profiles!user_id (
            full_name,
            email,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setVerifications(data as SmileIDVerification[]);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les vérifications",
        variant: "destructive"
      });
      console.error('Error fetching verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleApprove = async () => {
    if (!selectedVerification) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('smile_id_verifications')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes || null
        })
        .eq('id', selectedVerification.id);

      if (error) throw error;

      // Update user profile to mark as verified
      await supabase
        .from('profiles')
        .update({ smile_id_verified: true })
        .eq('id', selectedVerification.user_id);

      toast({
        title: "Vérification approuvée",
        description: "L'utilisateur a été certifié avec succès"
      });

      setSelectedVerification(null);
      setReviewNotes('');
      fetchVerifications();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible d'approuver la vérification",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedVerification) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('smile_id_verifications')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes || null
        })
        .eq('id', selectedVerification.id);

      if (error) throw error;

      toast({
        title: "Vérification rejetée",
        description: "L'utilisateur a été notifié du rejet"
      });

      setSelectedVerification(null);
      setReviewNotes('');
      fetchVerifications();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de rejeter la vérification",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: VerificationStatus) => {
    const variants = {
      pending: { variant: 'secondary' as const, icon: Clock, label: 'En attente' },
      approved: { variant: 'default' as const, icon: CheckCircle2, label: 'Approuvé' },
      rejected: { variant: 'destructive' as const, icon: XCircle, label: 'Rejeté' }
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredVerifications = verifications.filter(v => v.status === activeTab);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">File de Vérification Smile ID</h2>
        <p className="text-muted-foreground">
          Examinez et approuvez les vérifications d'identité Smile ID
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {verifications.filter(v => v.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approuvées</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {verifications.filter(v => v.status === 'approved').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejetées</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {verifications.filter(v => v.status === 'rejected').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as VerificationStatus)}>
        <TabsList>
          <TabsTrigger value="pending">
            En attente ({verifications.filter(v => v.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approuvées ({verifications.filter(v => v.status === 'approved').length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejetées ({verifications.filter(v => v.status === 'rejected').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-4">
          {filteredVerifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune vérification {activeTab === 'pending' ? 'en attente' : activeTab === 'approved' ? 'approuvée' : 'rejetée'}</p>
              </CardContent>
            </Card>
          ) : (
            filteredVerifications.map((verification) => (
              <Card key={verification.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={verification.user_profile?.avatar_url || undefined} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {verification.user_profile?.full_name || 'Utilisateur inconnu'}
                        </CardTitle>
                        <CardDescription>
                          {verification.user_profile?.email}
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(verification.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Score de confiance:</span>
                      <p className={`font-semibold ${getConfidenceColor(verification.confidence_score)}`}>
                        {(verification.confidence_score * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Résultat:</span>
                      <p className="font-semibold">{verification.result_text}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Job ID:</span>
                      <p className="font-mono text-xs">{verification.smile_job_id}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Date de soumission:</span>
                      <p>{format(new Date(verification.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}</p>
                    </div>
                  </div>

                  {verification.status === 'pending' && (
                    <Button
                      onClick={() => setSelectedVerification(verification)}
                      className="w-full"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Examiner la vérification
                    </Button>
                  )}

                  {verification.review_notes && (
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm font-semibold mb-1">Notes de révision:</p>
                      <p className="text-sm text-muted-foreground">{verification.review_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={!!selectedVerification} onOpenChange={() => setSelectedVerification(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Examiner la vérification Smile ID</DialogTitle>
            <DialogDescription>
              Vérifiez les informations et approuvez ou rejetez la vérification
            </DialogDescription>
          </DialogHeader>

          {selectedVerification && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedVerification.user_profile?.avatar_url || undefined} />
                  <AvatarFallback>
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedVerification.user_profile?.full_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedVerification.user_profile?.email}
                  </p>
                </div>
              </div>

              {/* Verification Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Score de confiance</Label>
                  <p className={`text-2xl font-bold ${getConfidenceColor(selectedVerification.confidence_score)}`}>
                    {(selectedVerification.confidence_score * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="space-y-1">
                  <Label>Résultat Smile ID</Label>
                  <p className="text-lg font-semibold">{selectedVerification.result_text}</p>
                </div>
              </div>

              {/* Images */}
              <div className="grid grid-cols-2 gap-4">
                {selectedVerification.selfie_image_url && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Photo Selfie
                    </Label>
                    <img
                      src={selectedVerification.selfie_image_url}
                      alt="Selfie"
                      className="w-full rounded-lg border"
                    />
                  </div>
                )}
                {selectedVerification.id_image_url && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Document d'identité
                    </Label>
                    <img
                      src={selectedVerification.id_image_url}
                      alt="ID Document"
                      className="w-full rounded-lg border"
                    />
                  </div>
                )}
              </div>

              {/* Review Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes de révision (optionnel)</Label>
                <Textarea
                  id="notes"
                  placeholder="Ajoutez des notes sur cette vérification..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Confidence Warning */}
              {selectedVerification.confidence_score < 0.7 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-900">Score de confiance faible</p>
                    <p className="text-sm text-yellow-700">
                      Le score de confiance est inférieur à 70%. Examinez attentivement les images avant d'approuver.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedVerification(null)}
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={submitting}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Rejeter
            </Button>
            <Button
              onClick={handleApprove}
              disabled={submitting}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Approuver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

