import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ONECIForm from '@/components/verification/ONECIForm';
import CNAMForm from '@/components/verification/CNAMForm';
import VerificationStatus from '@/components/verification/VerificationStatus';
import FaceVerification from '@/components/verification/FaceVerification';
import { Shield } from 'lucide-react';
import ErrorBoundary from '@/components/ErrorBoundary';

const Verification = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-background" translate="no">
        <Navbar />
      
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-3 mb-4">
                <Shield className="h-10 w-10 text-secondary" />
                <h1 className="text-3xl font-bold">Vérification d'Identité</h1>
              </div>
              <p className="text-muted-foreground">
                Complétez vos vérifications ONECI, CNAM et Face ID pour augmenter votre crédibilité
              </p>
            </div>

            <VerificationStatus />

            <Tabs defaultValue="oneci" className="mt-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="oneci">
                  Vérification ONECI
                </TabsTrigger>
                <TabsTrigger value="cnam" className="relative">
                  <span>Vérification CNAM</span>
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-secondary/50 text-secondary-foreground">
                    Optionnel
                  </span>
                </TabsTrigger>
                <TabsTrigger value="face">
                  Vérification Faciale
                </TabsTrigger>
              </TabsList>

              <TabsContent value="oneci">
                <Card>
                  <CardHeader>
                    <CardTitle>Vérification ONECI</CardTitle>
                    <CardDescription>
                      Vérifiez votre identité avec votre Carte Nationale d'Identité
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ONECIForm />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="cnam">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Vérification CNAM
                      <span className="text-xs px-2 py-1 rounded-full bg-secondary/50 text-secondary-foreground font-normal">
                        Optionnel
                      </span>
                    </CardTitle>
                    <CardDescription>
                      Vérifiez votre situation professionnelle avec la CNAM pour augmenter votre score de +25 points
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CNAMForm />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="face">
                <Card>
                  <CardHeader>
                    <CardTitle>Vérification Faciale</CardTitle>
                    <CardDescription>
                      Renforcez votre profil avec une vérification biométrique Smile ID
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FaceVerification />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        <Footer />
      </div>
    </ErrorBoundary>
  );
};

export default Verification;
