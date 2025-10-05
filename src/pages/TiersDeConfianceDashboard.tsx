import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Clock, FileText } from 'lucide-react';
import DossierValidationQueue from '@/components/tiers/DossierValidationQueue';

const TiersDeConfianceDashboard = () => {
  const { user, hasRole, loading } = useAuth();
  const [stats, setStats] = useState({
    validated: 0,
    pending: 0,
    rejected: 0
  });

  useEffect(() => {
    if (user && hasRole('tiers_de_confiance')) {
      fetchStats();
    }
  }, [user, hasRole]);

  const fetchStats = async () => {
    const { count: validated } = await supabase
      .from('rental_applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');

    const { count: pending } = await supabase
      .from('rental_applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { count: rejected } = await supabase
      .from('rental_applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rejected');

    setStats({
      validated: validated || 0,
      pending: pending || 0,
      rejected: rejected || 0
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasRole('tiers_de_confiance')) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Espace Tiers de Confiance</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dossiers Validés</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.validated}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Attente</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejetés</CardTitle>
              <FileText className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Validation Queue */}
        <Tabs defaultValue="queue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="queue">File d'attente</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
          </TabsList>

          <TabsContent value="queue">
            <DossierValidationQueue onUpdate={fetchStats} />
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Historique des validations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Fonctionnalité à venir</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default TiersDeConfianceDashboard;
