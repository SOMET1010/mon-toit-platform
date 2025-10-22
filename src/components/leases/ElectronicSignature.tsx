import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Shield, Loader2, Send, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { celebrateLeaseSigned } from '@/utils/confetti';
import { DigitalCertificate } from './DigitalCertificate';
import { SignatureStatus } from './SignatureStatus';
import { canSignElectronically } from '@/lib/signature-validation';
import { handleCryptoNeoError } from '@/lib/cryptoneo-error-handler';

interface Lease {
  id: string;
  landlord_id: string;
  tenant_id: string;
  landlord_signed_at: string | null;
  tenant_signed_at: string | null;
  landlord_cryptoneo_signature_at: string | null;
  tenant_cryptoneo_signature_at: string | null;
  is_electronically_signed: boolean;
  cryptoneo_signature_status?: string | null;
}

interface ElectronicSignatureProps {
  lease: Lease;
  userType: 'proprietaire' | 'locataire';
  onSignatureComplete: () => void;
}

export const ElectronicSignature = ({ lease, userType, onSignatureComplete }: ElectronicSignatureProps) => {
  const { user } = useAuth();
  const [signatureType, setSignatureType] = useState<'simple' | 'electronic'>('simple');
  const [signing, setSigning] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpExpiresAt, setOtpExpiresAt] = useState<Date | null>(null);
  const [operationId, setOperationId] = useState<string | null>(null);
  const [canSign, setCanSign] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [userPhone, setUserPhone] = useState<string>('');

  const isLandlord = userType === 'proprietaire';
  const hasSignedSimple = isLandlord ? lease.landlord_signed_at : lease.tenant_signed_at;
  const hasSignedElectronic = isLandlord 
    ? lease.landlord_cryptoneo_signature_at 
    : lease.tenant_cryptoneo_signature_at;

  useEffect(() => {
    if (user && signatureType === 'electronic') {
      validateSignature();
      fetchUserPhone();
    }
  }, [user, signatureType, lease.id]);

  // Timer for OTP expiration
  useEffect(() => {
    if (!otpExpiresAt) return;

    const interval = setInterval(() => {
      if (new Date() > otpExpiresAt) {
        setOtpSent(false);
        setOtpExpiresAt(null);
        toast({
          title: 'Code OTP expiré',
          description: 'Veuillez demander un nouveau code',
          variant: 'destructive'
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [otpExpiresAt]);

  const fetchUserPhone = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('phone')
      .eq('id', user.id)
      .single();
    
    if (data?.phone) {
      setUserPhone(data.phone);
    }
  };

  const validateSignature = async () => {
    if (!user) return;

    const result = await canSignElectronically(user.id, lease.id);
    setCanSign(result.canSign);
    if (result.reason) {
      setValidationMessage(result.reason);
    }
  };

  const handleSimpleSign = async () => {
    setSigning(true);
    try {
      const { error } = await supabase
        .from('leases')
        .update({
          [isLandlord ? 'landlord_signed_at' : 'tenant_signed_at']: new Date().toISOString()
        })
        .eq('id', lease.id);

      if (error) throw error;

      toast({
        title: 'Signature enregistrée',
        description: 'Votre signature simple a été enregistrée'
      });
      onSignatureComplete();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSigning(false);
    }
  };

  const handleSendOtp = async () => {
    if (!userPhone) {
      toast({
        title: 'Numéro de téléphone manquant',
        description: 'Veuillez ajouter votre numéro de téléphone dans votre profil',
        variant: 'destructive'
      });
      return;
    }

    setSendingOtp(true);

    try {
      const { data, error } = await supabase.functions.invoke('cryptoneo-send-otp', {
        body: {
          phone: userPhone
        }
      });

      if (error) {
        throw error;
      }

      setOtpSent(true);
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5); // OTP expires in 5 minutes
      setOtpExpiresAt(expiresAt);

      toast({
        title: 'Code OTP envoyé',
        description: `Un code de vérification a été envoyé au ${userPhone}`,
      });
    } catch (error: any) {
      const errorHandling = handleCryptoNeoError(error);
      toast({
        title: 'Erreur',
        description: errorHandling.userMessage,
        variant: 'destructive'
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleElectronicSign = async () => {
    if (!canSign) {
      toast({
        title: 'Prérequis non remplis',
        description: validationMessage,
        variant: 'destructive'
      });
      return;
    }

    if (!otpSent || !otp) {
      toast({
        title: 'Code OTP requis',
        description: 'Veuillez d\'abord demander et saisir le code OTP',
        variant: 'destructive'
      });
      return;
    }

    if (otp.length !== 6) {
      toast({
        title: 'Code OTP invalide',
        description: 'Le code OTP doit contenir 6 chiffres',
        variant: 'destructive'
      });
      return;
    }

    setSigning(true);

    try {
      const { data, error } = await supabase.functions.invoke('cryptoneo-sign-document', {
        body: {
          leaseId: lease.id,
          otp: otp
        }
      });

      if (error) {
        const errorHandling = handleCryptoNeoError(error);
        toast({
          title: 'Erreur',
          description: errorHandling.userMessage,
          variant: 'destructive'
        });
        
        if (errorHandling.action === 'fallback_simple_signature') {
          setSignatureType('simple');
        }
      } else {
        setOperationId(data.operationId);
        toast({
          title: 'Signature en cours',
          description: 'Votre signature électronique est en cours de traitement...'
        });
        
        // Reset OTP fields
        setOtp('');
        setOtpSent(false);
        setOtpExpiresAt(null);
      }
    } catch (error: any) {
      const errorHandling = handleCryptoNeoError(error);
      toast({
        title: 'Erreur',
        description: errorHandling.userMessage,
        variant: 'destructive'
      });
    } finally {
      setSigning(false);
    }
  };

  const getRemainingTime = () => {
    if (!otpExpiresAt) return '';
    const now = new Date();
    const diff = Math.max(0, Math.floor((otpExpiresAt.getTime() - now.getTime()) / 1000));
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (lease.is_electronically_signed) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-medium text-green-900 dark:text-green-100">
                Bail signé électroniquement
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Les deux parties ont signé électroniquement via CryptoNeo
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Signer le bail</CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs value={signatureType} onValueChange={(v) => setSignatureType(v as 'simple' | 'electronic')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="simple">
              <FileText className="h-4 w-4 mr-2" />
              Signature Simple
            </TabsTrigger>
            <TabsTrigger value="electronic">
              <Shield className="h-4 w-4 mr-2" />
              Signature Électronique
            </TabsTrigger>
          </TabsList>

          <TabsContent value="simple" className="space-y-4 mt-4">
            {hasSignedSimple ? (
              <p className="text-sm text-muted-foreground">
                Vous avez signé le {new Date(hasSignedSimple).toLocaleDateString('fr-FR')}
              </p>
            ) : (
              <Button 
                onClick={handleSimpleSign} 
                disabled={signing}
                className="w-full"
              >
                {signing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signature en cours...
                  </>
                ) : (
                  'Signer simplement'
                )}
              </Button>
            )}
          </TabsContent>

          <TabsContent value="electronic" className="space-y-4 mt-4">
            <DigitalCertificate />

            {hasSignedElectronic ? (
              <p className="text-sm text-green-600 dark:text-green-400">
                ✓ Vous avez signé électroniquement le {new Date(hasSignedElectronic).toLocaleDateString('fr-FR')}
              </p>
            ) : (
              <div className="space-y-4">
                {/* OTP Section */}
                <div className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="otp" className="text-sm font-medium">
                      Code de vérification (OTP)
                    </Label>
                    {otpSent && otpExpiresAt && (
                      <span className="text-xs text-muted-foreground">
                        Expire dans {getRemainingTime()}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSendOtp}
                      disabled={sendingOtp || (otpSent && !!otpExpiresAt && new Date() < otpExpiresAt)}
                      className="flex-shrink-0"
                    >
                      {sendingOtp ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Envoi...
                        </>
                      ) : otpSent ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                          Renvoyer
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Envoyer OTP
                        </>
                      )}
                    </Button>

                    <Input
                      id="otp"
                      type="text"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      disabled={!otpSent}
                      className="text-center text-lg tracking-widest font-mono"
                    />
                  </div>

                  {userPhone && (
                    <p className="text-xs text-muted-foreground">
                      Le code sera envoyé au {userPhone}
                    </p>
                  )}
                </div>

                {/* Sign Button */}
                <Button 
                  onClick={handleElectronicSign} 
                  disabled={signing || !canSign || !otpSent || otp.length !== 6}
                  className="w-full"
                >
                  {signing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Signature en cours...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Signer avec CryptoNeo
                    </>
                  )}
                </Button>

                {!canSign && validationMessage && (
                  <p className="text-sm text-muted-foreground">{validationMessage}</p>
                )}
              </div>
            )}

            {operationId && (
              <SignatureStatus 
                operationId={operationId} 
                onComplete={onSignatureComplete}
              />
            )}

            {lease.cryptoneo_signature_status === 'processing' && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  Signature en cours de traitement...
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

