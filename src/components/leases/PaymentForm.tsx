/**
 * Formulaire de paiement Mobile Money pour les baux
 * Supporte Orange Money, MTN Money, Moov Money
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PaymentFormProps {
  leaseId: string;
  amount: number;
  onPaymentSuccess: () => void;
}

type Provider = 'orange_money' | 'mtn_money' | 'moov_money';
type PaymentStatus = 'idle' | 'processing' | 'otp_sent' | 'success' | 'failed';

export function PaymentForm({ leaseId, amount, onPaymentSuccess }: PaymentFormProps) {
  const [provider, setProvider] = useState<Provider>('orange_money');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [transactionId, setTransactionId] = useState<string>('');
  const [error, setError] = useState<string>('');

  const providers = [
    {
      id: 'orange_money' as Provider,
      name: 'Orange Money',
      color: 'bg-orange-500',
      logo: '🟠',
    },
    {
      id: 'mtn_money' as Provider,
      name: 'MTN Money',
      color: 'bg-yellow-500',
      logo: '🟡',
    },
    {
      id: 'moov_money' as Provider,
      name: 'Moov Money',
      color: 'bg-blue-500',
      logo: '🔵',
    },
  ];

  const handleInitiatePayment = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: 'Numéro invalide',
        description: 'Veuillez entrer un numéro de téléphone valide',
        variant: 'destructive',
      });
      return;
    }

    setStatus('processing');
    setError('');

    try {
      // Appel à l'API de paiement (à implémenter dans payments.ts)
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lease_id: leaseId,
          amount,
          provider,
          phone_number: phoneNumber,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTransactionId(data.transaction_id);
        setStatus('otp_sent');
        toast({
          title: 'Code OTP envoyé',
          description: `Un code de confirmation a été envoyé au ${phoneNumber}`,
        });
      } else {
        throw new Error(data.error || 'Erreur lors de l\'initiation du paiement');
      }
    } catch (err: any) {
      setError(err.message);
      setStatus('failed');
      toast({
        title: 'Erreur de paiement',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const handleConfirmPayment = async () => {
    if (!otp || otp.length < 4) {
      toast({
        title: 'Code OTP invalide',
        description: 'Veuillez entrer le code reçu par SMS',
        variant: 'destructive',
      });
      return;
    }

    setStatus('processing');
    setError('');

    try {
      const response = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_id: transactionId,
          otp,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        toast({
          title: 'Paiement réussi !',
          description: `Le montant de ${amount.toLocaleString('fr-FR')} FCFA a été débité`,
        });
        setTimeout(() => {
          onPaymentSuccess();
        }, 2000);
      } else {
        throw new Error(data.error || 'Erreur lors de la confirmation du paiement');
      }
    } catch (err: any) {
      setError(err.message);
      setStatus('failed');
      toast({
        title: 'Erreur de confirmation',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Paiement Mobile Money
        </CardTitle>
        <CardDescription>
          Montant à payer : <span className="font-bold text-lg">{amount.toLocaleString('fr-FR')} FCFA</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Choix du provider */}
        {status === 'idle' && (
          <>
            <div className="space-y-3">
              <Label>Choisissez votre opérateur</Label>
              <RadioGroup value={provider} onValueChange={(value) => setProvider(value as Provider)}>
                {providers.map((p) => (
                  <div key={p.id} className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value={p.id} id={p.id} />
                    <Label htmlFor={p.id} className="flex items-center gap-3 cursor-pointer flex-1">
                      <span className="text-2xl">{p.logo}</span>
                      <span className="font-semibold">{p.name}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Numéro de téléphone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Ex: 0707070707"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                maxLength={10}
              />
              <p className="text-xs text-muted-foreground">
                Le numéro doit être associé à votre compte {providers.find(p => p.id === provider)?.name}
              </p>
            </div>

            <Button onClick={handleInitiatePayment} className="w-full" size="lg">
              Continuer
            </Button>
          </>
        )}

        {/* Confirmation OTP */}
        {status === 'otp_sent' && (
          <>
            <Alert>
              <AlertDescription>
                Un code de confirmation a été envoyé au <strong>{phoneNumber}</strong>.
                Entrez ce code pour finaliser le paiement.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="otp">Code OTP</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Entrez le code reçu"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setStatus('idle')} variant="outline" className="flex-1">
                Annuler
              </Button>
              <Button onClick={handleConfirmPayment} className="flex-1">
                Confirmer
              </Button>
            </div>
          </>
        )}

        {/* Processing */}
        {status === 'processing' && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Traitement en cours...</p>
          </div>
        )}

        {/* Success */}
        {status === 'success' && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">Paiement réussi !</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Transaction ID: {transactionId}
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {status === 'failed' && error && (
          <>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={() => setStatus('idle')} variant="outline" className="w-full">
              Réessayer
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

