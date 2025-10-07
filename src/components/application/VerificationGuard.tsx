import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import ONECIForm from '@/components/verification/ONECIForm';
import { Shield, AlertTriangle, CheckCircle2, FileText, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VerificationGuardProps {
  propertyId: string;
  onVerified?: () => void;
  children: React.ReactNode;
}

interface UserVerification {
  oneci_status: string;
  oneci_verified_at: string | null;
}

export const VerificationGuard = ({ propertyId, onVerified, children }: VerificationGuardProps) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [verification, setVerification] = useState<UserVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (user) {
      checkVerificationStatus();
    }
  }, [user]);

  const checkVerificationStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_verifications')
        .select('oneci_status, oneci_verified_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      setVerification(data);
    } catch (error) {
      console.error('Error checking verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour continuer",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    // Check if ONECI verification is completed
    const isONECIVerified = profile?.oneci_verified || verification?.oneci_status === 'verified';

    if (!isONECIVerified) {
      // Show verification dialog
      setDialogOpen(true);
    } else {
      // Proceed to application
      if (onVerified) {
        onVerified();
      } else {
        navigate(`/application/${propertyId}`);
      }
    }
  };

  const handleVerificationSuccess = async () => {
    setVerifying(true);
    
    // Wait a moment for the verification to process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Recheck verification status
    await checkVerificationStatus();
    
    toast({
      title: "Vérification soumise !",
      description: "Votre demande de vérification a été envoyée. Vous pouvez maintenant continuer votre candidature.",
    });

    setDialogOpen(false);
    setVerifying(false);

    // Proceed to application
    if (onVerified) {
      onVerified();
    } else {
      navigate(`/application/${propertyId}`);
    }
  };

  const isVerified = profile?.oneci_verified || verification?.oneci_status === 'verified';
  const isPending = verification?.oneci_status === 'pending' || verification?.oneci_status === 'pending_review';

  return (
    <>
      <div onClick={handleClick}>
        {children}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Shield className="h-6 w-6 text-primary" />
              Vérification d'identité requise
            </DialogTitle>
            <DialogDescription>
              Pour postuler à ce bien, vous devez d'abord vérifier votre identité via ONECI
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Why verification is needed */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Pourquoi cette vérification ?</AlertTitle>
              <AlertDescription>
                La vérification ONECI permet aux propriétaires de confirmer votre identité 
                et d'augmenter la confiance dans votre candidature. C'est une étape rapide 
                et sécurisée.
              </AlertDescription>
            </Alert>

            {/* Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                <Shield className="h-8 w-8 text-primary mb-2" />
                <h4 className="font-semibold mb-1">Sécurisé</h4>
                <p className="text-xs text-muted-foreground">
                  Vos données sont protégées
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                <CheckCircle2 className="h-8 w-8 text-green-600 mb-2" />
                <h4 className="font-semibold mb-1">Rapide</h4>
                <p className="text-xs text-muted-foreground">
                  Seulement quelques minutes
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                <FileText className="h-8 w-8 text-blue-600 mb-2" />
                <h4 className="font-semibold mb-1">Une seule fois</h4>
                <p className="text-xs text-muted-foreground">
                  Valable pour toutes vos candidatures
                </p>
              </div>
            </div>

            {/* Verification status */}
            {isPending && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Vérification en cours</AlertTitle>
                <AlertDescription>
                  Votre demande de vérification est en cours de traitement. 
                  Vous pouvez continuer votre candidature pendant ce temps.
                </AlertDescription>
              </Alert>
            )}

            {/* ONECI Form */}
            {!isVerified && !isPending && (
              <div className="border rounded-lg p-6 bg-muted/20">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Vérification ONECI
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Complétez le formulaire ci-dessous pour vérifier votre identité. 
                  Une fois validé, vous pourrez continuer votre candidature.
                </p>
                <ONECIForm />
                <div className="mt-4">
                  <Button 
                    onClick={handleVerificationSuccess} 
                    className="w-full"
                    disabled={verifying}
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Traitement en cours...
                      </>
                    ) : (
                      'J\'ai soumis ma vérification'
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              {isPending && (
                <Button
                  onClick={() => {
                    setDialogOpen(false);
                    if (onVerified) {
                      onVerified();
                    } else {
                      navigate(`/application/${propertyId}`);
                    }
                  }}
                  className="flex-1"
                >
                  Continuer la candidature
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};