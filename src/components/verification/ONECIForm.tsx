import { useState, lazy, Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/services/logger';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

// Lazy load FaceVerification to avoid blocking the main page
const FaceVerification = lazy(() => import('./FaceVerification'));

interface ONECIFormProps {
  onSubmit?: () => void;
}

const ONECIForm = ({ onSubmit }: ONECIFormProps = {}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [oneciVerified, setOneciVerified] = useState(false);
  const [showFaceVerification, setShowFaceVerification] = useState(false);
  const [formData, setFormData] = useState({
    cniNumber: '',
    lastName: '',
    firstName: '',
    birthDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Frontend CNI format validation
    const cniRegex = /^CI\d{10}$/;
    if (!formData.cniNumber.match(cniRegex)) {
      toast({
        title: 'Format CNI invalide',
        description: 'Le numéro CNI doit commencer par "CI" suivi de 10 chiffres (ex: CI1234567890)',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      // Call ONECI verification edge function
      const { data: verificationResult, error: functionError } = await supabase.functions.invoke(
        'oneci-verification',
        {
          body: {
            cniNumber: formData.cniNumber,
            lastName: formData.lastName,
            firstName: formData.firstName,
            birthDate: formData.birthDate,
          },
        }
      );

      // Enhanced error extraction from edge function
      if (functionError) {
        const errorData = (functionError as any).context?.body;
        if (errorData?.error) {
          throw new Error(errorData.error);
        } else if (errorData?.status === 'SERVICE_UNAVAILABLE') {
          throw new Error('Service de vérification ONECI temporairement indisponible');
        }
        throw functionError;
      }

      // Check if verification result has error
      if (verificationResult?.error || verificationResult?.status === 'FAILED') {
        throw new Error(verificationResult.error || verificationResult.message || 'Vérification échouée');
      }

      // Success case
      toast({
        title: 'Vérification envoyée',
        description: verificationResult.message || 'Votre demande de vérification a été envoyée. Elle sera validée par un administrateur sous 48h.',
      });

      setFormData({ cniNumber: '', lastName: '', firstName: '', birthDate: '' });
      setOneciVerified(true);
      setShowFaceVerification(true);
      
      // Notifie le parent que le formulaire a été soumis
      onSubmit?.();
    } catch (error: any) {
      logger.error('ONECI verification error', { error, userId: user?.id });
      
      // Parse error for user-friendly messages
      let errorTitle = 'Erreur de vérification';
      let errorDescription = 'Une erreur est survenue lors de la vérification';
      
      const errorMessage = error?.message || error?.error || String(error);
      
      if (errorMessage.includes('SERVICE_UNAVAILABLE') || errorMessage.includes('indisponible')) {
        errorTitle = 'Service indisponible';
        errorDescription = 'Le service de vérification ONECI est temporairement indisponible. Réessayez dans quelques instants.';
      } else if (errorMessage.includes('Format CNI') || errorMessage.includes('invalide')) {
        errorTitle = 'Format invalide';
        errorDescription = 'Le numéro CNI doit commencer par "CI" suivi de 10 chiffres (ex: CI1234567890)';
      } else if (errorMessage.includes('Session') || errorMessage.includes('authentifi')) {
        errorTitle = 'Session expirée';
        errorDescription = 'Votre session a expiré. Veuillez vous reconnecter et réessayer.';
      } else if (errorMessage.includes('non trouvée') || errorMessage.includes('not found')) {
        errorTitle = 'CNI non trouvée';
        errorDescription = 'Ce numéro CNI n\'a pas été trouvé dans la base ONECI. Vérifiez vos informations.';
      } else if (errorMessage.includes('Edge Function')) {
        errorTitle = 'Erreur de connexion';
        errorDescription = 'Impossible de se connecter au service de vérification. Vérifiez votre connexion internet.';
      } else if (errorMessage.trim()) {
        errorDescription = errorMessage;
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFaceVerificationSuccess = () => {
    toast({
      title: 'Vérification complète !',
      description: 'Votre identité ONECI et votre Face ID ont été vérifiés avec succès',
    });
    // TODO Phase 2: Replace with queryClient.invalidateQueries(['user_verifications'])
    setTimeout(() => {
      window.location.reload();
    }, 1500); // Reduced from 2000ms
  };

  const handleSkipFaceVerification = () => {
    toast({
      title: 'Vérification ONECI effectuée',
      description: 'Vous pourrez ajouter la vérification faciale plus tard',
    });
    // TODO Phase 2: Replace with queryClient.invalidateQueries(['user_verifications'])
    setTimeout(() => {
      window.location.reload();
    }, 1500); // Reduced from 2000ms
  };

  if (showFaceVerification && oneciVerified) {
    return (
      <div className="space-y-4">
        <Suspense fallback={
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }>
          <FaceVerification 
            onSuccess={handleFaceVerificationSuccess}
            onSkip={handleSkipFaceVerification}
          />
        </Suspense>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cniNumber">Numéro CNI</Label>
        <Input
          id="cniNumber"
          placeholder="CI1234567890"
          value={formData.cniNumber}
          onChange={(e) => setFormData({ ...formData, cniNumber: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lastName">Nom de famille</Label>
        <Input
          id="lastName"
          placeholder="KOUASSI"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="firstName">Prénom(s)</Label>
        <Input
          id="firstName"
          placeholder="Kouadio Jean"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="birthDate">Date de naissance</Label>
        <Input
          id="birthDate"
          type="date"
          value={formData.birthDate}
          onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Vérification en cours...
          </>
        ) : (
          'Vérifier mon identité'
        )}
      </Button>
    </form>
  );
};

export default ONECIForm;
