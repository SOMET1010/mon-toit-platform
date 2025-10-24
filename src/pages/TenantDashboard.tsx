import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { DynamicBreadcrumb } from '@/components/navigation/DynamicBreadcrumb';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ApplicationsStatusWidget } from '@/components/dashboard/tenant/ApplicationsStatusWidget';
import { ActiveLeaseWidget } from '@/components/dashboard/tenant/ActiveLeaseWidget';
import { PaymentHistoryWidget } from '@/components/dashboard/tenant/PaymentHistoryWidget';
import { MaintenanceRequestsWidget } from '@/components/dashboard/tenant/MaintenanceRequestsWidget';
import { LayoutDashboard } from 'lucide-react';

const TenantDashboard = () => {
  const { user } = useAuth();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['tenant-dashboard', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      // Try RPC first, fallback to direct queries if it doesn't exist
      let data = null;
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_tenant_dashboard_summary', {
        p_tenant_id: user.id
      });

      // If RPC exists and works, use it
      if (!rpcError && rpcData) {
        data = rpcData;
      } else {
        // Fallback: fetch data directly from tables
        console.warn('RPC get_tenant_dashboard_summary not found, using fallback queries');
        
        // Fetch applications
        const { data: applications, error: appsError } = await supabase
          .from('rental_applications')
          .select('*')
          .eq('tenant_id', user.id)
          .order('created_at', { ascending: false });

        if (appsError) throw appsError;

        // Fetch leases
        const { data: leases, error: leasesError } = await supabase
          .from('leases')
          .select('*')
          .eq('tenant_id', user.id)
          .order('created_at', { ascending: false });

        if (leasesError) throw leasesError;

        // Fetch payments
        const { data: payments, error: paymentsError } = await supabase
          .from('payments')
          .select('*')
          .eq('tenant_id', user.id)
          .order('created_at', { ascending: false });

        if (paymentsError) throw paymentsError;

        // Fetch maintenance requests
        const { data: maintenance, error: maintenanceError } = await supabase
          .from('maintenance_requests')
          .select('*')
          .eq('tenant_id', user.id)
          .order('created_at', { ascending: false });

        if (maintenanceError) throw maintenanceError;

        // Build summary data structure
        const activeLeases = leases?.filter(l => l.status === 'active') || [];
        const pendingApps = applications?.filter(a => a.status === 'pending') || [];
        const approvedApps = applications?.filter(a => a.status === 'approved') || [];
        const rejectedApps = applications?.filter(a => a.status === 'rejected') || [];
        
        const totalPaid = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
        const pendingPayments = payments?.filter(p => p.status === 'pending') || [];
        
        const pendingMaintenance = maintenance?.filter(m => m.status === 'pending') || [];
        const inProgressMaintenance = maintenance?.filter(m => m.status === 'in_progress') || [];
        const completedMaintenance = maintenance?.filter(m => m.status === 'completed') || [];

        data = {
          applications: {
            total: applications?.length || 0,
            pending: pendingApps.length,
            approved: approvedApps.length,
            rejected: rejectedApps.length,
            recent: applications?.slice(0, 5) || []
          },
          leases: {
            active: activeLeases.length,
            total: leases?.length || 0,
            current: activeLeases[0] || null
          },
          payments: {
            total_paid: totalPaid,
            pending: pendingPayments.length,
            count: payments?.length || 0,
            recent: payments?.slice(0, 5) || []
          },
          maintenance: {
            total: maintenance?.length || 0,
            pending: pendingMaintenance.length,
            in_progress: inProgressMaintenance.length,
            completed: completedMaintenance.length,
            recent: maintenance?.slice(0, 5) || []
          }
        };
      }

      return data as {
        applications: {
          total: number;
          pending: number;
          approved: number;
          rejected: number;
          recent: any[];
        };
        leases: {
          active: number;
          total: number;
          current: any;
        };
        payments: {
          total_paid: number;
          pending: number;
          count: number;
          recent: any[];
        };
        maintenance: {
          total: number;
          pending: number;
          in_progress: number;
          completed: number;
          recent: any[];
        };
      };
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 pt-24">
        <div className="mb-10">
          <DynamicBreadcrumb />
          
          <h1 className="text-4xl font-bold mb-3 mt-6 flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            Tableau de bord Locataire
          </h1>
          <p className="text-lg text-muted-foreground">
            Vue d'ensemble de vos candidatures, baux et paiements
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ApplicationsStatusWidget data={dashboardData?.applications} />
          <ActiveLeaseWidget data={dashboardData?.leases} />
          <PaymentHistoryWidget data={dashboardData?.payments} />
          <MaintenanceRequestsWidget data={dashboardData?.maintenance} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TenantDashboard;

