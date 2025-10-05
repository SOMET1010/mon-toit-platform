import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Shield } from 'lucide-react';

interface TwoFactorVerifyProps {
  onVerified: () => void;
  onCancel: () => void;
}

export const TwoFactorVerify = ({ onVerified, onCancel }: TwoFactorVerifyProps) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (code.length !== 6) return;

    setLoading(true);
    try {
      // Get the active TOTP factor
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactor = factors?.totp?.[0];

      if (!totpFactor) {
        throw new Error('Aucun facteur 2FA trouvé');
      }

      // Create a challenge
      const challenge = await supabase.auth.mfa.challenge({ 
        factorId: totpFactor.id 
      });

      if (challenge.error) throw challenge.error;

      // Verify the code
      const verify = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challenge.data.id,
        code,
      });

      if (verify.error) throw verify.error;

      toast({
        title: 'Vérification réussie',
        description: 'Connexion en cours...',
      });
      
      onVerified();
    } catch (error: any) {
      toast({
        title: 'Code invalide',
        description: 'Veuillez vérifier le code et réessayer',
        variant: 'destructive',
      });
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Authentification à deux facteurs
        </CardTitle>
        <CardDescription>
          Entrez le code à 6 chiffres de votre application d'authentification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="text"
          placeholder="000000"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          className="text-center text-2xl tracking-widest"
          autoFocus
        />

        <div className="flex gap-2">
          <Button 
            onClick={handleVerify} 
            disabled={loading || code.length !== 6}
            className="flex-1"
          >
            Vérifier
          </Button>
          <Button 
            variant="outline" 
            onClick={onCancel}
          >
            Annuler
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
