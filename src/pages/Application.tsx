import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Upload, FileText } from 'lucide-react';
import DocumentUpload from '@/components/application/DocumentUpload';
import { ApplicationStatusTracker } from '@/components/application/ApplicationStatusTracker';

type Property = {
  id: string;
  title: string;
  monthly_rent: number;
  deposit_amount: number;
  city: string;
};

const Application = () => {
  const { propertyId } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [documents, setDocuments] = useState<any[]>([]);
  const [verification, setVerification] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (propertyId) {
      fetchPropertyAndVerification();
    }
  }, [propertyId]);

  const fetchPropertyAndVerification = async () => {
    try {
      const { data: propertyData, error: propError } = await supabase
        .from('properties')
        .select('id, title, monthly_rent, deposit_amount, city')
        .eq('id', propertyId)
        .single();

      if (propError) throw propError;
      setProperty(propertyData);

      if (user) {
        const { data: verificationData } = await supabase
          .from('user_verifications')
          .select('*')
          .eq('user_id', user.id)
          .single();

        setVerification(verificationData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les informations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !propertyId) return;

    if (documents.length === 0) {
      toast({
        title: 'Documents requis',
        description: 'Veuillez ajouter au moins un document justificatif pour soumettre votre candidature',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

      try {
        const { data, error } = await supabase
          .from('rental_applications')
          .upsert({
            property_id: propertyId,
            applicant_id: user.id,
            cover_letter: coverLetter || '',
            documents: documents,
            status: 'pending',
          }, {
            onConflict: 'property_id,applicant_id',
            ignoreDuplicates: false
          })
          .select()
          .single();

      if (error) throw error;

      // Calculate tenant score automatically
      try {
        const { data: scoringData } = await supabase.functions.invoke('tenant-scoring', {
          body: {
            applicantId: user.id,
            propertyId: propertyId,
            monthlyRent: property.monthly_rent,
          },
        });

        if (scoringData?.score) {
          await supabase
            .from('rental_applications')
            .update({ application_score: scoringData.score })
            .eq('id', data.id);
        }
      } catch (scoringError) {
        console.error('Error calculating score:', scoringError);
        // Don't block application if scoring fails
      }

      toast({
        title: 'Candidature soumise',
        description: 'Votre dossier a été envoyé au propriétaire',
      });

      navigate(`/property/${propertyId}`);
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de soumettre la candidature',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!property) {
    return <div>Bien non trouvé</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 pt-24 max-w-4xl">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/property/${propertyId}`)}
            className="mb-4 -ml-2"
          >
            ← Retour au bien
          </Button>
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Postuler pour {property.title}
          </h1>
          <p className="text-lg text-muted-foreground">
            {property.city} • {property.monthly_rent.toLocaleString()} FCFA/mois
          </p>
        </div>

        <div className="space-y-6">
          {/* Note: ApplicationStatusTracker sera visible après soumission */}
          
          {/* Vérifications */}
          <Card className="border-2 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <CheckCircle className="h-5 w-5 text-primary" />
                Votre profil de vérification
              </CardTitle>
              <CardDescription>
                Ces informations renforceront votre candidature auprès du propriétaire
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  {profile?.oneci_verified ? (
                    <div className="p-2 rounded-full bg-green-500/10">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  ) : (
                    <div className="p-2 rounded-full bg-muted">
                      <XCircle className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">Vérification ONECI</p>
                    <p className="text-xs text-muted-foreground">Carte d'identité nationale</p>
                  </div>
                </div>
                {!profile?.oneci_verified && (
                  <Button variant="outline" size="sm" onClick={() => navigate('/certification')} className="rounded-xl">
                    Vérifier
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  {profile?.cnam_verified ? (
                    <div className="p-2 rounded-full bg-green-500/10">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  ) : (
                    <div className="p-2 rounded-full bg-muted">
                      <XCircle className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">Vérification CNAM</p>
                    <p className="text-xs text-muted-foreground">Situation professionnelle</p>
                  </div>
                </div>
                {!profile?.cnam_verified && (
                  <Button variant="outline" size="sm" onClick={() => navigate('/certification')} className="rounded-xl">
                    Vérifier
                  </Button>
                )}
              </div>

              {verification && verification.tenant_score > 0 && (
                <div className="mt-4 p-5 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-lg">Score locataire</p>
                      <p className="text-sm text-muted-foreground">Basé sur vos vérifications</p>
                    </div>
                    <Badge variant="default" className="text-lg px-4 py-2 rounded-xl">
                      {verification.tenant_score}/100
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="border-2 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Upload className="h-5 w-5 text-primary" />
                Documents justificatifs
              </CardTitle>
              <CardDescription>
                Ajoutez vos documents pour compléter votre dossier (CNI, fiches de paie, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentUpload 
                documents={documents} 
                onDocumentsChange={setDocuments}
                userId={user?.id || ''}
              />
            </CardContent>
          </Card>


          {/* Récapitulatif */}
          <Card className="border-2 shadow-lg bg-gradient-to-br from-background to-muted/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Récapitulatif de votre candidature</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-xl bg-background">
                <span className="text-muted-foreground">Loyer mensuel</span>
                <span className="font-bold text-lg">{property.monthly_rent.toLocaleString()} FCFA</span>
              </div>
              {property.deposit_amount && (
                <div className="flex justify-between items-center p-3 rounded-xl bg-background">
                  <span className="text-muted-foreground">Caution</span>
                  <span className="font-bold text-lg">{property.deposit_amount.toLocaleString()} FCFA</span>
                </div>
              )}
              <div className="flex justify-between items-center p-3 rounded-xl bg-background">
                <span className="text-muted-foreground">Documents joints</span>
                <Badge variant={documents.length > 0 ? "default" : "destructive"} className="rounded-xl">
                  {documents.length > 0 ? `${documents.length} fichier${documents.length > 1 ? 's' : ''}` : 'Requis'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() => navigate(`/property/${propertyId}`)}
              className="flex-1 h-14 rounded-xl text-base"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 h-14 rounded-xl text-base font-semibold shadow-lg"
            >
              {submitting ? 'Envoi en cours...' : '📤 Soumettre ma candidature'}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Application;
