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

const ONECIForm = () => {
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

      if (functionError) throw functionError;

      // Note: Ne pas mettre à jour user_verifications ni profiles ici
      // L'edge function le fait déjà et met le statut en 'pending_review'
      // pour validation par un admin

      toast({
        title: verificationResult.valid ? 'Vérification envoyée' : 'Vérification échouée',
        description: verificationResult.valid 
          ? 'Votre demande de vérification a été envoyée. Elle sera validée par un administrateur sous 48h.'
          : verificationResult.error || verificationResult.message,
        variant: verificationResult.valid ? 'default' : 'destructive',
      });

      if (verificationResult.valid) {
        setFormData({ cniNumber: '', lastName: '', firstName: '', birthDate: '' });
        setOneciVerified(true);
        setShowFaceVerification(true);
      }
    } catch (error) {
      logger.error('ONECI verification error', { error, userId: user?.id });
      
      // Contextual error messages
      let errorTitle = 'Erreur';
      let errorDescription = 'Une erreur est survenue lors de la vérification';
      
      if (error instanceof Error) {
        if (error.message.includes('SERVICE_UNAVAILABLE') || error.message.includes('indisponible')) {
          errorTitle = 'Service temporairement indisponible';
          errorDescription = 'La vérification ONECI est en maintenance. Réessayez dans quelques minutes.';
        } else if (error.message.includes('Format CNI')) {
          errorTitle = 'Format CNI incorrect';
          errorDescription = 'Veuillez saisir un numéro CNI valide (CI + 10 chiffres)';
        } else if (error.message.includes('Session')) {
          errorTitle = 'Session expirée';
          errorDescription = 'Veuillez vous reconnecter et réessayer.';
        } else {
          errorDescription = error.message;
        }
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
