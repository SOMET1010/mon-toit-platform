import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Building2, Users, BarChart3, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/auth" replace />;
  }

  const dashboardContent = {
    locataire: {
      title: 'Tableau de bord Locataire',
      cards: [
        { title: 'Mes Candidatures', icon: Home, description: 'Suivez vos candidatures', link: '/mes-candidatures' },
        { title: 'Mes Favoris', icon: Building2, description: 'Biens sauvegardés', link: '/favoris' },
      ],
    },
    proprietaire: {
      title: 'Tableau de bord Propriétaire',
      cards: [
        { title: 'Mes Biens', icon: Building2, description: 'Gérer mes propriétés', link: '/mes-biens' },
        { title: 'Candidatures Reçues', icon: Users, description: 'Gérer les candidatures', link: '/candidatures' },
        { title: 'Statistiques', icon: BarChart3, description: 'Performance de vos biens', link: '/stats' },
      ],
    },
    agence: {
      title: 'Tableau de bord Agence',
      cards: [
        { title: 'Portfolio', icon: Building2, description: 'Tous les biens', link: '/portfolio' },
        { title: 'Équipe', icon: Users, description: 'Gestion de l\'équipe', link: '/equipe' },
        { title: 'Statistiques', icon: BarChart3, description: 'Performance globale', link: '/stats' },
      ],
    },
    admin_ansut: {
      title: 'Tableau de bord Admin ANSUT',
      cards: [
        { title: 'Utilisateurs', icon: Users, description: 'Gestion des utilisateurs', link: '/admin/users' },
        { title: 'Propriétés', icon: Building2, description: 'Toutes les propriétés', link: '/admin/properties' },
        { title: 'Rapports', icon: BarChart3, description: 'Statistiques globales', link: '/admin/reports' },
      ],
    },
  };

  const content = dashboardContent[profile.user_type];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold">{content.title}</h1>
              <p className="text-muted-foreground mt-2">Bienvenue, {profile.full_name}</p>
            </div>
            {profile.user_type === 'proprietaire' && (
              <Button asChild>
                <Link to="/ajouter-bien">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un bien
                </Link>
              </Button>
            )}
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.cards.map((card, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <card.icon className="h-5 w-5 text-primary" />
                    <CardTitle>{card.title}</CardTitle>
                  </div>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link to={card.link}>Accéder</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
