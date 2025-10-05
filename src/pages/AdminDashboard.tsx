import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, Home, Users, FileText, Settings, Shield } from 'lucide-react';
import AdminStats from '@/components/admin/AdminStats';
import AdminProperties from '@/components/admin/AdminProperties';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminLeases from '@/components/admin/AdminLeases';
import AdminIntegrations from '@/components/admin/AdminIntegrations';
import PlatformAnalytics from '@/components/admin/PlatformAnalytics';
import DisputeManager from '@/components/admin/DisputeManager';
import AdminVerificationQueue from '@/components/admin/AdminVerificationQueue';
import ReviewModeration from '@/components/admin/ReviewModeration';
import AdvancedReporting from '@/components/admin/AdvancedReporting';
import LeaseCertificationQueue from '@/components/admin/LeaseCertificationQueue';
import { AuditLogViewer } from '@/components/admin/AuditLogViewer';
import { LeaseTemplateManager } from '@/components/admin/LeaseTemplateManager';
import { PromoteToSuperAdmin } from '@/components/admin/PromoteToSuperAdmin';
import PropertyModerationQueue from '@/components/admin/PropertyModerationQueue';
import SensitiveDataAccessMonitor from '@/components/admin/SensitiveDataAccessMonitor';
import { MfaSecurityMonitor } from '@/components/admin/MfaSecurityMonitor';
import { supabase } from '@/integrations/supabase/client';

const AdminDashboard = () => {
  const { hasRole, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingCertifications, setPendingCertifications] = useState(0);
  const [openDisputes, setOpenDisputes] = useState(0);
  const [pendingProperties, setPendingProperties] = useState(0);

  useEffect(() => {
    const fetchPendingCount = async () => {
      const { count } = await supabase
        .from('leases')
        .select('*', { count: 'exact', head: true })
        .eq('certification_status', 'pending');
      setPendingCertifications(count || 0);
    };

    const fetchOpenDisputes = async () => {
      const { count } = await supabase
        .from('disputes')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');
      setOpenDisputes(count || 0);
    };

    const fetchPendingProperties = async () => {
      const { count } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('moderation_status', 'pending');
      setPendingProperties(count || 0);
    };

    fetchPendingCount();
    fetchOpenDisputes();
    fetchPendingProperties();

    const leasesChannel = supabase
      .channel('admin-pending-count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leases',
          filter: 'certification_status=eq.pending'
        },
        () => fetchPendingCount()
      )
      .subscribe();

    const disputesChannel = supabase
      .channel('admin-open-disputes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'disputes',
          filter: 'status=eq.open'
        },
        () => fetchOpenDisputes()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(leasesChannel);
      supabase.removeChannel(disputesChannel);
    };
  }, []);

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
          <TabsList className="grid w-full grid-cols-12 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="certifications" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Certifications
              {pendingCertifications > 0 && (
                <Badge variant="destructive" className="ml-1 px-1.5 py-0.5 text-xs">
                  {pendingCertifications}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="verifications">Vérifications</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="certifications" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Certifications
              {pendingCertifications > 0 && (
                <Badge variant="destructive" className="ml-1 px-1.5 py-0.5 text-xs">
                  {pendingCertifications}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="verifications">Vérifications</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="disputes" className="flex items-center gap-2">
              Litiges
              {openDisputes > 0 && (
                <Badge variant="destructive" className="ml-1 px-1.5 py-0.5 text-xs">
                  {openDisputes}
                </Badge>
              )}
            </TabsTrigger>
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
            <TabsTrigger value="mfa" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Sécurité 2FA
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AdminStats />
          </TabsContent>

          <TabsContent value="certifications" className="space-y-6">
            <LeaseCertificationQueue />
          </TabsContent>

          <TabsContent value="verifications" className="space-y-6">
            <AdminVerificationQueue />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <SensitiveDataAccessMonitor />
          </TabsContent>

          <TabsContent value="mfa" className="space-y-6">
            <MfaSecurityMonitor />
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            {!hasRole('super_admin') && !hasRole('admin') && (
              <PromoteToSuperAdmin />
            )}
            <AuditLogViewer />
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
            <Tabs defaultValue="list" className="w-full">
              <TabsList>
                <TabsTrigger value="list">Liste des Baux</TabsTrigger>
                <TabsTrigger value="templates">Modèles de Baux</TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="mt-4">
                <AdminLeases />
              </TabsContent>

              <TabsContent value="templates" className="mt-4">
                <LeaseTemplateManager />
              </TabsContent>
            </Tabs>
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
