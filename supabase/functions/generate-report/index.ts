import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportRequest {
  reportType: 'user_performance' | 'property_performance' | 'platform_activity' | 'financial';
  startDate?: string;
  endDate?: string;
  filters?: {
    city?: string;
    userType?: string;
  };
  format?: 'json' | 'csv';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin
    const { data: isAdmin } = await supabase.rpc('has_role', { 
      _user_id: user.id, 
      _role: 'admin' 
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { reportType, startDate, endDate, filters, format = 'json' }: ReportRequest = await req.json();

    let reportData: any = {};

    // Generate report based on type
    if (reportType === 'user_performance') {
      // Top landlords
      const { data: landlords } = await supabase
        .from('profiles')
        .select('id, full_name, user_type, created_at')
        .eq('user_type', 'proprietaire');

      const landlordStats = await Promise.all(
        (landlords || []).map(async (landlord) => {
          const { count: propertyCount } = await supabase
            .from('properties')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', landlord.id);

          const { count: leaseCount } = await supabase
            .from('leases')
            .select('*', { count: 'exact', head: true })
            .eq('landlord_id', landlord.id);

          return {
            id: landlord.id,
            name: landlord.full_name,
            properties: propertyCount || 0,
            leases: leaseCount || 0,
            joinedAt: landlord.created_at,
          };
        })
      );

      // Top tenants
      const { data: tenants } = await supabase
        .from('profiles')
        .select('id, full_name, user_type, created_at')
        .eq('user_type', 'locataire');

      const tenantStats = await Promise.all(
        (tenants || []).map(async (tenant) => {
          const { count: appCount } = await supabase
            .from('rental_applications')
            .select('*', { count: 'exact', head: true })
            .eq('applicant_id', tenant.id);

          const { count: leaseCount } = await supabase
            .from('leases')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenant.id);

          return {
            id: tenant.id,
            name: tenant.full_name,
            applications: appCount || 0,
            leases: leaseCount || 0,
            joinedAt: tenant.created_at,
          };
        })
      );

      reportData = {
        topLandlords: landlordStats.sort((a, b) => b.properties - a.properties).slice(0, 10),
        topTenants: tenantStats.sort((a, b) => b.applications - a.applications).slice(0, 10),
      };

    } else if (reportType === 'property_performance') {
      const { data: properties } = await supabase
        .from('properties')
        .select('*');

      const { data: applications } = await supabase
        .from('rental_applications')
        .select('property_id, created_at, status');

      // Calculate metrics
      const totalProperties = properties?.length || 0;
      const totalViews = properties?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0;
      const avgViews = totalProperties > 0 ? totalViews / totalProperties : 0;

      const propertiesWithLeases = await Promise.all(
        (properties || []).map(async (prop) => {
          const { data: lease } = await supabase
            .from('leases')
            .select('created_at')
            .eq('property_id', prop.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (lease) {
            const daysToRent = Math.ceil(
              (new Date(lease.created_at).getTime() - new Date(prop.created_at).getTime()) / (24 * 60 * 60 * 1000)
            );
            return daysToRent;
          }
          return null;
        })
      );

      const validDays = propertiesWithLeases.filter(d => d !== null) as number[];
      const avgDaysToRent = validDays.length > 0 ? validDays.reduce((sum, d) => sum + d, 0) / validDays.length : 0;

      const conversionRate = totalProperties > 0 ? (validDays.length / totalProperties) * 100 : 0;

      reportData = {
        totalProperties,
        avgDaysToRent: Math.round(avgDaysToRent),
        avgViews: Math.round(avgViews),
        conversionRate: conversionRate.toFixed(2),
      };

    } else if (reportType === 'platform_activity') {
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: propertyCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

      const { count: applicationCount } = await supabase
        .from('rental_applications')
        .select('*', { count: 'exact', head: true });

      const { count: leaseCount } = await supabase
        .from('leases')
        .select('*', { count: 'exact', head: true });

      reportData = {
        totalUsers: userCount || 0,
        totalProperties: propertyCount || 0,
        totalApplications: applicationCount || 0,
        totalLeases: leaseCount || 0,
      };

    } else if (reportType === 'financial') {
      const { data: payments } = await supabase
        .from('payments')
        .select('amount, status, payment_type, created_at');

      const completedPayments = payments?.filter(p => p.status === 'completed') || [];
      const totalRevenue = completedPayments.reduce((sum, p) => sum + Number(p.amount), 0);

      reportData = {
        totalPayments: payments?.length || 0,
        completedPayments: completedPayments.length,
        totalRevenue,
        avgPayment: completedPayments.length > 0 ? totalRevenue / completedPayments.length : 0,
      };
    }

    // Format output
    if (format === 'csv') {
      const csvData = convertToCSV(reportData);
      return new Response(csvData, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${reportType}_${new Date().toISOString()}.csv"`,
        },
      });
    }

    return new Response(JSON.stringify({
      reportType,
      generatedAt: new Date().toISOString(),
      data: reportData,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function convertToCSV(data: any): string {
  if (Array.isArray(data)) {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    return [headers, ...rows].join('\n');
  } else {
    const headers = Object.keys(data).join(',');
    const values = Object.values(data).join(',');
    return [headers, values].join('\n');
  }
}
