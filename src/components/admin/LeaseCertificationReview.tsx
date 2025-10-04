import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, User, Home, FileText, Shield } from 'lucide-react';
import ANSUTCertifiedBadge from '@/components/ui/ansut-certified-badge';

interface LeaseCertificationReviewProps {
  leaseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdated?: () => void;
}

interface LeaseDetails {
  id: string;
  property_id: string;
  landlord_id: string;
  tenant_id: string;
  monthly_rent: number;
  deposit_amount: number;
  start_date: string;
  end_date: string;
  certification_status: string;
  certification_notes: string | null;
  landlord_signed_at: string | null;
  tenant_signed_at: string | null;
  ansut_certified_at: string | null;
  property: {
    title: string;
    address: string;
    city: string;
  };
  landlord: {
    full_name: string;
    oneci_verified: boolean;
    cnam_verified: boolean;
  };
  tenant: {
    full_name: string;
    oneci_verified: boolean;
    cnam_verified: boolean;
  };
}

const LeaseCertificationReview = ({ leaseId, open, onOpenChange, onStatusUpdated }: LeaseCertificationReviewProps) => {
  const [lease, setLease] = useState<LeaseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    if (open && leaseId) {
      fetchLeaseDetails();
    }
  }, [open, leaseId]);

  const fetchLeaseDetails = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leases')
        .select(`
          *,
          property:properties!leases_property_id_fkey(title, address, city),
          landlord:profiles!leases_landlord_id_fkey(full_name, oneci_verified, cnam_verified),
          tenant:profiles!leases_tenant_id_fkey(full_name, oneci_verified, cnam_verified)
        `)
        .eq('id', leaseId)
        .single();

      if (error) throw error;
      setLease(data as any);
      setAdminNotes(data.certification_notes || '');
    } catch (error) {
      console.error('Error fetching lease:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les détails du bail',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCertification = async (status: 'certified' | 'rejected') => {
    setActionLoading(true);
    try {
      const updateData: any = {
        certification_status: status,
        certification_notes: adminNotes.trim() || null,
      };

      if (status === 'certified') {
        updateData.ansut_certified_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('leases')
        .update(updateData)
        .eq('id', leaseId);

      if (error) throw error;

      toast({
        title: status === 'certified' ? 'Bail certifié' : 'Certification refusée',
        description: status === 'certified' 
          ? 'Le bail a été certifié avec succès par l\'ANSUT'
          : 'La demande de certification a été refusée',
      });

      onOpenChange(false);
      onStatusUpdated?.();
    } catch (error: any) {
      console.error('Error updating certification:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de mettre à jour la certification',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!lease) return null;

  const isFullySigned = lease.landlord_signed_at && lease.tenant_signed_at;
  const bothVerified = lease.landlord.oneci_verified && lease.tenant.oneci_verified;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-secondary" />
            Examen de Certification ANSUT
          </DialogTitle>
          <DialogDescription>
            Examinez le dossier complet avant de certifier le bail
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status actuel */}
          <div>
            <ANSUTCertifiedBadge 
              status={lease.certification_status as any}
              certifiedAt={lease.ansut_certified_at}
              variant="detailed"
            />
          </div>

          {/* Informations bien */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Home className="h-4 w-4" />
              Bien Immobilier
            </div>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="font-medium">{lease.property.title}</p>
              <p className="text-sm text-muted-foreground">
                {lease.property.address}, {lease.property.city}
              </p>
              <div className="flex gap-4 text-sm">
                <span>Loyer: {lease.monthly_rent.toLocaleString()} FCFA/mois</span>
                {lease.deposit_amount && (
                  <span>Caution: {lease.deposit_amount.toLocaleString()} FCFA</span>
                )}
              </div>
            </div>
          </div>

          {/* Parties */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Propriétaire */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <User className="h-4 w-4" />
                Propriétaire
              </div>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="font-medium">{lease.landlord.full_name}</p>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    {lease.landlord.oneci_verified ? (
                      <Badge className="bg-green-600">ONECI Vérifié</Badge>
                    ) : (
                      <Badge variant="outline">ONECI Non vérifié</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {lease.landlord.cnam_verified ? (
                      <Badge className="bg-green-600">CNAM Vérifié</Badge>
                    ) : (
                      <Badge variant="outline">CNAM Non vérifié</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {lease.landlord_signed_at ? (
                      <Badge className="bg-blue-600">
                        Signé le {new Date(lease.landlord_signed_at).toLocaleDateString('fr-FR')}
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Non signé</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Locataire */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <User className="h-4 w-4" />
                Locataire
              </div>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="font-medium">{lease.tenant.full_name}</p>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    {lease.tenant.oneci_verified ? (
                      <Badge className="bg-green-600">ONECI Vérifié</Badge>
                    ) : (
                      <Badge variant="outline">ONECI Non vérifié</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {lease.tenant.cnam_verified ? (
                      <Badge className="bg-green-600">CNAM Vérifié</Badge>
                    ) : (
                      <Badge variant="outline">CNAM Non vérifié</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {lease.tenant_signed_at ? (
                      <Badge className="bg-blue-600">
                        Signé le {new Date(lease.tenant_signed_at).toLocaleDateString('fr-FR')}
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Non signé</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vérifications */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-4 w-4" />
              Critères de Certification
            </div>
            <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Bail signé par les deux parties</span>
                {isFullySigned ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>Identités vérifiées (ONECI)</span>
                {bothVerified ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="admin-notes">
              Notes de certification (visibles par les parties)
            </Label>
            <Textarea
              id="admin-notes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Ajoutez vos observations ou commentaires..."
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={actionLoading}
            >
              Fermer
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleCertification('rejected')}
              disabled={actionLoading}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Refuser
            </Button>
            <Button
              onClick={() => handleCertification('certified')}
              disabled={actionLoading || !isFullySigned}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Certifier
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeaseCertificationReview;
