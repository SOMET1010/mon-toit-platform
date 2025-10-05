import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, Home, Users, FileText, Settings } from 'lucide-react';
import AdminStats from '@/components/admin/AdminStats';
import AdminProperties from '@/components/admin/AdminProperties';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminLeases from '@/components/admin/AdminLeases';
import AdminIntegrations from '@/components/admin/AdminIntegrations';
import PlatformAnalytics from '@/components/admin/PlatformAnalytics';
import DisputeManager from '@/components/admin/DisputeManager';
import ReviewModeration from '@/components/admin/ReviewModeration';
import AdvancedReporting from '@/components/admin/AdvancedReporting';

const AdminDashboard = () => {
  const { hasRole, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasRole('admin')) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Administration ANSUT
          </h1>
          <p className="text-muted-foreground">
            Gestion et validation de la plateforme Mon Toit
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="disputes">Litiges</TabsTrigger>
            <TabsTrigger value="moderation">Modération</TabsTrigger>
            <TabsTrigger value="reporting">Rapports</TabsTrigger>
            <TabsTrigger value="properties" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Biens
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="leases" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Baux
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AdminStats />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <PlatformAnalytics />
          </TabsContent>

          <TabsContent value="disputes" className="space-y-6">
            <DisputeManager />
          </TabsContent>

          <TabsContent value="moderation" className="space-y-6">
            <ReviewModeration />
          </TabsContent>

          <TabsContent value="reporting" className="space-y-6">
            <AdvancedReporting />
          </TabsContent>

          <TabsContent value="properties" className="space-y-6">
            <AdminProperties />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <AdminUsers />
          </TabsContent>

          <TabsContent value="leases" className="space-y-6">
            <AdminLeases />
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <AdminIntegrations />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
