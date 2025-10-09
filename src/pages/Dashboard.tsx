import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { DynamicBreadcrumb } from '@/components/navigation/DynamicBreadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Building2, Users, BarChart3, Plus, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RecommendationsSection } from '@/components/recommendations/RecommendationsSection';
import { PreferencesModal } from '@/components/recommendations/PreferencesModal';
import SearchHistory from '@/components/dashboard/SearchHistory';
import SmartReminders from '@/components/dashboard/SmartReminders';
import { ProfileScoreCard } from '@/components/dashboard/ProfileScoreCard';
import { QuickActionsGrid } from '@/components/dashboard/QuickActionsGrid';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { ApplicationsOverview } from '@/components/dashboard/ApplicationsOverview';
import { MarketInsightsWidget } from '@/components/dashboard/MarketInsightsWidget';

const Dashboard = () => {
  const { profile, loading, user } = useAuth();
  const [preferencesOpen, setPreferencesOpen] = useState(false);

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
        { title: 'Mes Candidatures', icon: Home, description: 'Suivez vos candidatures', link: '/candidatures' },
        { title: 'Mes Baux', icon: Building2, description: 'Consulter mes baux', link: '/baux' },
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
      
      <main className="flex-1 container mx-auto px-4 py-12 pt-24">
        <div className="max-w-6xl mx-auto space-y-8">
          <DynamicBreadcrumb />
          
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold">{content.title}</h1>
              <p className="text-muted-foreground mt-2">Bienvenue, {profile.full_name}</p>
            </div>
            <div className="flex gap-2">
              {profile.user_type === 'locataire' && (
                <Button variant="outline" onClick={() => setPreferencesOpen(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Mes préférences
                </Button>
              )}
              {profile.user_type === 'proprietaire' && (
                <Button asChild>
                  <Link to="/ajouter-bien">
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un bien
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Tenant Dashboard - Enhanced Layout */}
          {user && profile.user_type === 'locataire' && (
            <div className="space-y-8">
              {/* Hero Section - Profile Score & Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ProfileScoreCard />
                <div className="lg:col-span-2">
                  <QuickActionsGrid />
                </div>
              </div>

              {/* Applications Overview */}
              <ApplicationsOverview />

              {/* Smart Reminders */}
              <SmartReminders />

              {/* Recommendations Carousel */}
              <RecommendationsSection
                userId={user.id}
                type="properties"
                limit={8}
              />

              {/* Bottom Section - Market Insights, Activity & Search History */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <MarketInsightsWidget />
                <ActivityTimeline />
                <SearchHistory />
              </div>
            </div>
          )}

          {user && profile.user_type === 'proprietaire' && (
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle>Locataires recommandés</CardTitle>
                </div>
                <CardDescription>
                  Consultez vos candidatures pour voir les locataires les mieux notés pour chaque bien
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link to="/mes-biens">Voir mes biens et candidatures</Link>
                </Button>
              </CardContent>
            </Card>
          )}

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
      <PreferencesModal open={preferencesOpen} onOpenChange={setPreferencesOpen} />
    </div>
  );
};

export default Dashboard;
