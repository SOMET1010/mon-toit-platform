import { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { logger } from '@/services/logger';
import { supabase } from '@/integrations/supabase/client';
import { Camera, Upload, CheckCircle, XCircle, AlertCircle, Shield } from 'lucide-react';

// Simple progress bar component
const SimpleProgress = ({ value, className }: { value: number; className?: string }) => (
  <div className={`relative h-2 w-full overflow-hidden rounded-full bg-secondary ${className}`}>
    <div 
      className="h-full bg-primary transition-all duration-300"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

interface ONECIFormProps {
  onSubmit?: () => void;
}

const ONECIForm = ({ onSubmit }: ONECIFormProps = {}) => {
  const { user } = useAuth();
  const [cniImage, setCniImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    similarityScore: string;
    message: string;
    canRetry: boolean;
  } | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      console.log('🎥 Démarrage de la caméra...');
      setIsVideoLoading(true);
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('L\'API MediaDevices n\'est pas supportée par ce navigateur');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      console.log('📹 Stream vidéo obtenu:', stream.getVideoTracks()[0].getSettings());
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Attendre que la vidéo soit prête
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Référence vidéo perdue'));
            return;
          }

          const video = videoRef.current;
          
          const onLoadedMetadata = () => {
            console.log('✅ Métadonnées vidéo chargées:', {
              width: video.videoWidth,
              height: video.videoHeight
            });
            
            if (video.videoWidth > 0 && video.videoHeight > 0) {
              setIsCapturing(true);
              setIsVideoLoading(false);
              resolve();
            } else {
              reject(new Error('Dimensions vidéo invalides'));
            }
          };

          const onError = () => {
            reject(new Error('Erreur de chargement de la vidéo'));
          };

          video.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
          video.addEventListener('error', onError, { once: true });
          
          // Timeout de sécurité
          setTimeout(() => {
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
            
            if (video.videoWidth > 0 && video.videoHeight > 0) {
              setIsCapturing(true);
              setIsVideoLoading(false);
              resolve();
            } else {
              reject(new Error('Timeout: la vidéo n\'a pas chargé'));
            }
          }, 5000);
        });

        console.log('🎬 Caméra prête à capturer');
        toast.success('Caméra activée !');
      }
    } catch (error) {
      logger.error('Error accessing camera', { error });
      console.error('❌ Erreur caméra:', error);
      setIsVideoLoading(false);
      setIsCapturing(false);
      
      let errorMessage = 'Impossible d\'accéder à la caméra';
      let errorDescription = 'Vérifiez vos permissions et réessayez';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Autorisation caméra refusée';
          errorDescription = 'Autorisez l\'accès à la caméra dans les paramètres de votre navigateur';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'Aucune caméra trouvée';
          errorDescription = 'Vérifiez qu\'une caméra est connectée à votre appareil';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'La caméra est déjà utilisée';
          errorDescription = 'Fermez les autres applications utilisant la caméra';
        } else if (error.message.includes('Timeout')) {
          errorMessage = 'La caméra n\'a pas pu se charger';
          errorDescription = 'Réessayez ou rechargez la page';
        }
      }
      
      toast.error(errorMessage, { description: errorDescription });
      
      // Nettoyer le stream en cas d'erreur
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  const stopCamera = useCallback(() => {
    console.log('⏹️ Arrêt de la caméra');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
    setIsVideoLoading(false);
  }, []);

  const captureSelfie = () => {
    console.log('📸 Tentative de capture du selfie...');
    
    if (!videoRef.current || !canvasRef.current) {
      toast.error('Erreur de capture', { description: 'Références vidéo manquantes' });
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Vérifier que la vidéo a des dimensions valides
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.error('❌ Dimensions vidéo invalides:', {
        width: video.videoWidth,
        height: video.videoHeight
      });
      toast.error('Vidéo non prête', { 
        description: 'Attendez que la caméra charge complètement' 
      });
      return;
    }

    // Vérifier que le stream est actif
    if (!streamRef.current || streamRef.current.getTracks().length === 0) {
      console.error('❌ Aucun stream actif');
      toast.error('Caméra inactive', { 
        description: 'Relancez la caméra et réessayez' 
      });
      return;
    }

    console.log('✅ Capture du selfie:', {
      width: video.videoWidth,
      height: video.videoHeight
    });

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setSelfieImage(imageData);
      stopCamera();
      console.log('🎉 Selfie capturé avec succès');
      toast.success('Selfie capturé !');
    } else {
      console.error('❌ Impossible d\'obtenir le contexte canvas');
      toast.error('Erreur de capture', { description: 'Impossible de traiter l\'image' });
    }
  };

  const handleCniUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCniImage(reader.result as string);
        toast.success('Photo de CNI chargée !');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerify = async () => {
    if (!cniImage || !selfieImage) {
      toast.error('Veuillez fournir les deux images');
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('smile-id-verification', {
        body: {
          cniImageBase64: cniImage,
          selfieBase64: selfieImage,
        },
      });

      if (error) throw error;

      setVerificationResult(data);

      if (data.verified) {
        // Update profile
        await supabase
          .from('profiles')
          .update({ oneci_verified: true })
          .eq('id', user?.id);

        toast.success('Vérification ONECI réussie via Smile ID !', {
          description: `Score : ${data.similarityScore}%`
        });
        onSubmit?.();
      } else {
        toast.error('Vérification échouée', {
          description: data.message || data.resultText
        });
      }
    } catch (error) {
      logger.error('ONECI Smile ID verification error', { error });
      toast.error('Erreur lors de la vérification', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const reset = () => {
    setCniImage(null);
    setSelfieImage(null);
    setVerificationResult(null);
    stopCamera();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Vérification d'Identité ONECI
        </CardTitle>
        <CardDescription>
          Vérification sécurisée via Smile ID pour ressortissants ivoiriens
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Instructions importantes :</strong>
            <ul className="mt-2 space-y-1 text-sm list-disc list-inside">
              <li>Téléchargez une photo <strong>claire et nette</strong> de votre CNI ivoirienne</li>
              <li>Assurez-vous que <strong>toutes les informations</strong> sur la CNI sont lisibles</li>
              <li>Prenez un selfie avec un <strong>bon éclairage</strong> (lumière naturelle de préférence)</li>
              <li>Regardez <strong>directement la caméra</strong>, expression neutre</li>
              <li>Retirez <strong>lunettes, masque, chapeau</strong> ou tout accessoire</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-2 gap-6">
          {/* CNI Upload */}
          <div className="space-y-3">
            <Label htmlFor="cni-upload" className="text-base font-semibold">
              1. Photo de votre Carte Nationale d'Identité
            </Label>
            <p className="text-sm text-muted-foreground">
              Téléchargez une photo claire du recto de votre CNI
            </p>
            {cniImage ? (
              <div className="relative">
                <img 
                  src={cniImage} 
                  alt="CNI" 
                  className="w-full h-48 object-cover rounded-lg border-2 border-primary"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={() => setCniImage(null)}
                >
                  Retirer
                </Button>
              </div>
            ) : (
              <label 
                htmlFor="cni-upload"
                className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors bg-muted/30"
              >
                <Upload className="h-10 w-10 mb-3 text-primary" />
                <span className="text-sm font-medium">Cliquez pour télécharger</span>
                <span className="text-xs text-muted-foreground mt-1">Format accepté : JPG, PNG</span>
                <input
                  id="cni-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCniUpload}
                />
              </label>
            )}
          </div>

          {/* Selfie Capture */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              2. Selfie de vérification
            </Label>
            <p className="text-sm text-muted-foreground">
              Prenez une photo de votre visage pour vérification biométrique
            </p>
            {selfieImage ? (
              <div className="relative">
                <img 
                  src={selfieImage} 
                  alt="Selfie" 
                  className="w-full h-48 object-cover rounded-lg border-2 border-primary"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={() => setSelfieImage(null)}
                >
                  Retirer
                </Button>
              </div>
            ) : isCapturing ? (
              <div className="space-y-2">
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-48 object-cover rounded-lg border-2 border-primary"
                  />
                  {isVideoLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                      <div className="text-center text-white">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2" />
                        <p className="text-sm">Chargement de la caméra...</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={captureSelfie} 
                    className="flex-1"
                    disabled={isVideoLoading}
                  >
                    {isVideoLoading ? 'Chargement...' : 'Capturer'}
                  </Button>
                  <Button onClick={stopCamera} variant="outline">
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={startCamera}
                className="w-full h-48 flex flex-col gap-3 bg-muted/30"
                variant="outline"
              >
                <Camera className="h-10 w-10 text-primary" />
                <span className="font-medium">Ouvrir la caméra</span>
                <span className="text-xs text-muted-foreground">Selfie en direct</span>
              </Button>
            )}
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {verificationResult && (
          <Alert variant={verificationResult.verified ? "default" : "destructive"}>
            {verificationResult.verified ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">{verificationResult.message}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Score de similarité :</span>
                  <SimpleProgress value={parseFloat(verificationResult.similarityScore)} className="flex-1" />
                  <span className="text-sm font-bold">{verificationResult.similarityScore}%</span>
                </div>
                {!verificationResult.verified && verificationResult.canRetry && (
                  <p className="text-sm">
                    Vous pouvez réessayer avec de meilleures conditions.
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleVerify}
            disabled={!cniImage || !selfieImage || isVerifying}
            size="lg"
            className="w-full"
          >
            {isVerifying ? (
              <>
                <CheckCircle className="mr-2 h-5 w-5 animate-pulse" />
                Vérification en cours via Smile ID...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-5 w-5" />
                Vérifier mon identité ONECI
              </>
            )}
          </Button>
          
          {(cniImage || selfieImage || verificationResult) && (
            <Button onClick={reset} variant="outline" size="lg" className="w-full">
              Recommencer la vérification
            </Button>
          )}
        </div>

        <Alert className="bg-muted">
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Sécurité et confidentialité :</strong> Vos images sont transmises de manière sécurisée à Smile ID 
            pour vérification biométrique. Elles ne sont <strong>jamais stockées</strong> sur nos serveurs. 
            Seul le résultat de vérification (score de correspondance) est conservé dans votre profil.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default ONECIForm;
