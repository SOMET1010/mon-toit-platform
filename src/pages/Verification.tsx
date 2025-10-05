import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ONECIForm from '@/components/verification/ONECIForm';
import CNAMForm from '@/components/verification/CNAMForm';
import VerificationStatus from '@/components/verification/VerificationStatus';
import { Shield } from 'lucide-react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useEffect } from 'react';

const Verification = () => {
  const { user, profile, loading } = useAuth();

  // Debug logs
  useEffect(() => {
    console.log('🔍 Verification Page - State:', { 
      loading, 
      hasUser: !!user, 
      userId: user?.id,
      hasProfile: !!profile,
      profileType: profile?.user_type
    });
  }, [loading, user, profile]);

  console.log('🔍 Verification Page - Rendering with:', { loading, user: !!user, profile: !!profile });

  if (loading) {
    console.log('🔍 Verification Page - Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    console.log('🔍 Verification Page - No user, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  console.log('🔍 Verification Page - Rendering main content');

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Debug info */}
          <div className="mb-4 p-4 bg-muted rounded-lg text-sm">
            <p>👤 Utilisateur: {user?.email}</p>
            <p>📋 Profil: {profile?.full_name || 'Chargement...'}</p>
            <p>🔑 Type: {profile?.user_type || 'Non défini'}</p>
          </div>

          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <Shield className="h-10 w-10 text-secondary" />
              <h1 className="text-3xl font-bold">Vérification d'Identité</h1>
            </div>
            <p className="text-muted-foreground">
              Complétez vos vérifications ONECI et CNAM pour augmenter votre crédibilité
            </p>
          </div>

          <VerificationStatus />

          <Tabs defaultValue="oneci" className="mt-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="oneci">
                Vérification ONECI
              </TabsTrigger>
              <TabsTrigger value="cnam">
                Vérification CNAM
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
                  <CardTitle>Vérification CNAM</CardTitle>
                  <CardDescription>
                    Vérifiez votre situation professionnelle avec la CNAM
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CNAMForm />
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
