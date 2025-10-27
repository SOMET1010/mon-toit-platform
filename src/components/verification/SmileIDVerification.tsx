import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { logger } from '@/services/logger';
import { supabase } from '@/lib/supabase';
import { celebrateCertification } from '@/utils/confetti';
import { Camera, CheckCircle, XCircle, AlertCircle, Shield, Loader2 } from 'lucide-react';

/**
 * SmileIDVerification - Composant de vérification d'identité via Smile ID
 * 
 * Smile ID est une solution de vérification d'identité biométrique qui :
 * - Vérifie l'authenticité des documents d'identité
 * - Compare la photo du document avec un selfie en temps réel
 * - Se connecte aux bases de données gouvernementales (ONECI en Côte d'Ivoire)
 * - Détecte les tentatives de fraude (deepfakes, photos imprimées, etc.)
 * 
 * Documentation: https://docs.usesmileid.com/
 */

interface SmileIDVerificationProps {
  onSubmit?: () => void;
}

export const SmileIDVerification = ({ onSubmit }: SmileIDVerificationProps = {}) => {
  const { user } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    confidence: number;
    message: string;
    canRetry: boolean;
  } | null>(null);

  /**
   * Initialiser la vérification Smile ID
   * 
   * Étapes :
   * 1. Appeler la Supabase Edge Function 'smile-id-verification'
   * 2. Obtenir un token de session Smile ID
   * 3. Ouvrir le widget Smile ID dans une iframe/popup
   * 4. Attendre le résultat de la vérification
   * 5. Mettre à jour le profil utilisateur
   */
  const startVerification = async () => {
    if (!user) {
      toast.error('Erreur', { description: 'Vous devez être connecté' });
      return;
    }

    try {
      setIsVerifying(true);
      logger.info('Démarrage vérification Smile ID', { userId: user.id });

      // Appeler la Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('smile-id-verification', {
        body: {
          userId: user.id,
          action: 'initialize'
        }
      });

      if (error) throw error;

      if (data?.sessionToken) {
        // Ouvrir le widget Smile ID
        await openSmileIDWidget(data.sessionToken);
      } else {
        throw new Error('Token de session non reçu');
      }

    } catch (error) {
      logger.error('Erreur vérification Smile ID', { error });
      toast.error('Erreur de vérification', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue'
      });
      setIsVerifying(false);
    }
  };

  /**
   * Ouvrir le widget Smile ID
   * 
   * Le widget Smile ID gère :
   * - La capture de la pièce d'identité (CNI, passeport, etc.)
   * - La capture du selfie en temps réel
   * - La détection de vivacité (liveness detection)
   * - La comparaison biométrique
   */
  const openSmileIDWidget = async (sessionToken: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // TODO: Intégrer le SDK Smile ID
      // Documentation: https://docs.usesmileid.com/integration-options/web-integration
      
      // Pour l'instant, simuler le processus
      toast.info('Widget Smile ID', {
        description: 'Ouverture du widget de vérification...'
      });

      // Simuler une vérification (à remplacer par le vrai SDK)
      setTimeout(async () => {
        try {
          // Vérifier le résultat auprès de Smile ID
          const result = await checkVerificationResult(sessionToken);
          
          if (result.verified) {
            // Mettre à jour le profil utilisateur
            await updateUserVerificationStatus(result);
            
            setVerificationResult({
              verified: true,
              confidence: result.confidence,
              message: 'Identité vérifiée avec succès !',
              canRetry: false
            });

            celebrateCertification();
            toast.success('Vérification réussie !', {
              description: `Confiance: ${result.confidence}%`
            });

            if (onSubmit) onSubmit();
          } else {
            setVerificationResult({
              verified: false,
              confidence: result.confidence,
              message: result.message || 'La vérification a échoué',
              canRetry: true
            });

            toast.error('Vérification échouée', {
              description: result.message
            });
          }

          setIsVerifying(false);
          resolve();
        } catch (error) {
          logger.error('Erreur lors de la vérification', { error });
          setIsVerifying(false);
          reject(error);
        }
      }, 3000);
    });
  };

  /**
   * Vérifier le résultat de la vérification Smile ID
   */
  const checkVerificationResult = async (sessionToken: string) => {
    const { data, error } = await supabase.functions.invoke('smile-id-verification', {
      body: {
        userId: user?.id,
        action: 'check_result',
        sessionToken
      }
    });

    if (error) throw error;
    return data;
  };

  /**
   * Mettre à jour le statut de vérification de l'utilisateur
   */
  const updateUserVerificationStatus = async (result: any) => {
    const { error } = await supabase
      .from('profiles')
      .update({
        identity_verified: true,
        identity_verification_method: 'smile_id',
        identity_verification_date: new Date().toISOString(),
        identity_verification_confidence: result.confidence,
        updated_at: new Date().toISOString()
      })
      .eq('id', user?.id);

    if (error) {
      logger.error('Erreur mise à jour profil', { error });
      throw error;
    }

    logger.info('Profil mis à jour avec succès', { userId: user?.id });
  };

  /**
   * Réinitialiser et recommencer la vérification
   */
  const retryVerification = () => {
    setVerificationResult(null);
    startVerification();
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Vérification d'Identité</CardTitle>
              <CardDescription>
                Vérification biométrique sécurisée via Smile ID
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informations sur le processus */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">Comment ça marche ?</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Préparez votre pièce d'identité (CNI, passeport)</li>
                  <li>Prenez une photo de votre document</li>
                  <li>Prenez un selfie en temps réel</li>
                  <li>Notre système vérifie automatiquement votre identité</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>

          {/* Résultat de la vérification */}
          {verificationResult && (
            <Alert variant={verificationResult.verified ? "default" : "destructive"}>
              {verificationResult.verified ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">{verificationResult.message}</p>
                  {verificationResult.verified && (
                    <p className="text-sm">
                      Niveau de confiance : {verificationResult.confidence}%
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Boutons d'action */}
          <div className="flex gap-3">
            {!verificationResult ? (
              <Button
                onClick={startVerification}
                disabled={isVerifying}
                className="flex-1"
                size="lg"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Vérification en cours...
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 h-4 w-4" />
                    Démarrer la vérification
                  </>
                )}
              </Button>
            ) : verificationResult.canRetry ? (
              <Button
                onClick={retryVerification}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                Réessayer
              </Button>
            ) : null}
          </div>

          {/* Informations de sécurité */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="font-semibold">Sécurité et confidentialité</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Vos données sont chiffrées de bout en bout</li>
                  <li>Conformité RGPD et lois ivoiriennes</li>
                  <li>Technologie certifiée par ANSUT</li>
                  <li>Aucune donnée n'est partagée sans votre consentement</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

