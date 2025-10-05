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

      // Update or create user_verifications record
      const { error: upsertError } = await supabase
        .from('user_verifications')
        .upsert({
          user_id: user.id,
          oneci_cni_number: formData.cniNumber,
          oneci_status: verificationResult.valid ? 'verified' : 'failed',
          oneci_data: verificationResult.valid ? verificationResult.holder : null,
          oneci_verified_at: verificationResult.valid ? new Date().toISOString() : null,
        }, {
          onConflict: 'user_id'
        });

      if (upsertError) throw upsertError;

      // Update profile
      if (verificationResult.valid) {
        await supabase
          .from('profiles')
          .update({ oneci_verified: true })
          .eq('id', user.id);
      }

      toast({
        title: verificationResult.valid ? 'Vérification ONECI réussie' : 'Vérification échouée',
        description: verificationResult.valid 
          ? 'Vous pouvez maintenant effectuer la vérification faciale (optionnelle)'
          : verificationResult.error || verificationResult.message,
        variant: verificationResult.valid ? 'default' : 'destructive',
      });

      if (verificationResult.valid) {
        setFormData({ cniNumber: '', lastName: '', firstName: '', birthDate: '' });
        setOneciVerified(true);
        setShowFaceVerification(true);
      }
    } catch (error) {
      logger.error('ONECI verification error', { error, userId: user?.id, formData });
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue lors de la vérification',
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
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  const handleSkipFaceVerification = () => {
    toast({
      title: 'Vérification ONECI effectuée',
      description: 'Vous pourrez ajouter la vérification faciale plus tard',
    });
    setTimeout(() => {
      window.location.reload();
    }, 2000);
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
