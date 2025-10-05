import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Shield, Check } from 'lucide-react';

export const TwoFactorSetup = () => {
  const [step, setStep] = useState<'idle' | 'qr' | 'verify' | 'enabled'>('idle');
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [factorId, setFactorId] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);

  const enableTwoFactor = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      });

      if (error) throw error;

      if (data) {
        setQrCode(data.totp.qr_code);
        setSecret(data.totp.secret);
        setFactorId(data.id);
        setStep('qr');
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyAndEnable = async () => {
    if (!verificationCode || !factorId) return;

    setLoading(true);
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      
      if (challenge.error) throw challenge.error;

      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: verificationCode,
      });

      if (verify.error) throw verify.error;

      toast({
        title: '2FA activé',
        description: 'Authentification à deux facteurs activée avec succès',
      });
      setStep('enabled');
    } catch (error: any) {
      toast({
        title: 'Code invalide',
        description: 'Veuillez vérifier le code et réessayer',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === 'enabled') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            2FA Activé
          </CardTitle>
          <CardDescription>
            Votre compte est protégé par l'authentification à deux facteurs
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (step === 'qr') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scanner le QR Code</CardTitle>
          <CardDescription>
            Utilisez une application d'authentification (Google Authenticator, Authy, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center bg-white p-4 rounded-lg">
            <QRCodeSVG value={qrCode} size={200} />
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Ou entrez ce code manuellement :</p>
            <code className="block bg-muted p-2 rounded text-sm break-all">
              {secret}
            </code>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Code de vérification</label>
            <Input
              type="text"
              placeholder="000000"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={verifyAndEnable} 
              disabled={loading || verificationCode.length !== 6}
              className="flex-1"
            >
              Vérifier et Activer
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setStep('idle')}
            >
              Annuler
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Authentification à deux facteurs
        </CardTitle>
        <CardDescription>
          Renforcez la sécurité de votre compte administrateur
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={enableTwoFactor} disabled={loading}>
          Activer 2FA
        </Button>
      </CardContent>
    </Card>
  );
};
