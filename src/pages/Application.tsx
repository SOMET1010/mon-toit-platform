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

    if (!coverLetter.trim()) {
      toast({
        title: 'Lettre de motivation requise',
        description: 'Veuillez rédiger une lettre de motivation',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('rental_applications')
        .insert({
          property_id: propertyId,
          applicant_id: user.id,
          cover_letter: coverLetter,
          documents: documents,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

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
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Postuler pour {property.title}
          </h1>
          <p className="text-muted-foreground">
            {property.city} • {property.monthly_rent.toLocaleString()} FCFA/mois
          </p>
        </div>

        <div className="space-y-6">
          {/* Vérifications */}
          <Card>
            <CardHeader>
              <CardTitle>Votre profil de vérification</CardTitle>
              <CardDescription>
                Ces informations renforceront votre candidature
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {profile?.oneci_verified ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span>Vérification ONECI</span>
                </div>
                {!profile?.oneci_verified && (
                  <Button variant="outline" size="sm" onClick={() => navigate('/certification')}>
                    Vérifier
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {profile?.cnam_verified ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span>Vérification CNAM (Employeur)</span>
                </div>
                {!profile?.cnam_verified && (
                  <Button variant="outline" size="sm" onClick={() => navigate('/certification')}>
                    Vérifier
                  </Button>
                )}
              </div>

              {verification && verification.tenant_score > 0 && (
                <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Score locataire</span>
                    <Badge variant="default">{verification.tenant_score}/100</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Documents justificatifs</CardTitle>
              <CardDescription>
                Ajoutez vos documents pour compléter votre dossier
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

          {/* Lettre de motivation */}
          <Card>
            <CardHeader>
              <CardTitle>Lettre de motivation</CardTitle>
              <CardDescription>
                Présentez-vous et expliquez pourquoi vous souhaitez louer ce bien
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Présentez votre candidature..."
                className="min-h-[200px]"
              />
            </CardContent>
          </Card>

          {/* Récapitulatif */}
          <Card>
            <CardHeader>
              <CardTitle>Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Loyer mensuel</span>
                <span className="font-medium">{property.monthly_rent.toLocaleString()} FCFA</span>
              </div>
              {property.deposit_amount && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Caution</span>
                  <span className="font-medium">{property.deposit_amount.toLocaleString()} FCFA</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t">
                <span className="text-muted-foreground">Documents</span>
                <span className="font-medium">{documents.length} fichier(s)</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => navigate(`/property/${propertyId}`)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1"
            >
              {submitting ? 'Envoi en cours...' : 'Soumettre ma candidature'}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Application;
