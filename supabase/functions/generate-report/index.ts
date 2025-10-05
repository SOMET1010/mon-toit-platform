import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportRequest {
  reportType: 'performance' | 'financial' | 'verification' | 'complete';
  startDate?: string;
  endDate?: string;
  format: 'csv' | 'pdf';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Verify admin role
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roles) {
      throw new Error('Forbidden: Admin role required');
    }

    const { reportType, startDate, endDate, format }: ReportRequest = await req.json();

    // Build date filter
    let dateFilter = {};
    if (startDate) {
      dateFilter = { ...dateFilter, gte: startDate };
    }
    if (endDate) {
      dateFilter = { ...dateFilter, lte: endDate };
    }

    // Fetch data based on report type
    let reportData: any = {};

    if (reportType === 'performance' || reportType === 'complete') {
      const { data: profiles } = await supabase.from('profiles').select('*');
      const { data: properties } = await supabase.from('properties').select('*');
      const { data: applications } = await supabase.from('rental_applications').select('*');

      reportData.performance = {
        totalUsers: profiles?.length || 0,
        totalProperties: properties?.length || 0,
        totalApplications: applications?.length || 0,
      };
    }

    if (reportType === 'financial' || reportType === 'complete') {
      const { data: leases } = await supabase
        .from('leases')
        .select('*')
        .eq('status', 'active');

      const totalRevenue = leases?.reduce((sum, lease) => sum + Number(lease.monthly_rent || 0), 0) || 0;
      const ansutCommission = totalRevenue * 0.05; // 5% commission

      // Group by property type
      const { data: properties } = await supabase.from('properties').select('id, property_type');
      const { data: activeLeasesWithProperty } = await supabase
        .from('leases')
        .select('property_id, monthly_rent')
        .eq('status', 'active');

      const revenueByType: Record<string, number> = {};
      activeLeasesWithProperty?.forEach(lease => {
        const property = properties?.find(p => p.id === lease.property_id);
        if (property) {
          const type = property.property_type;
          revenueByType[type] = (revenueByType[type] || 0) + Number(lease.monthly_rent || 0);
        }
      });

      reportData.financial = {
        totalRevenue,
        ansutCommission,
        revenueByType,
        activeLeases: leases?.length || 0,
      };
    }

    if (reportType === 'verification' || reportType === 'complete') {
      const { data: verifications } = await supabase.from('user_verifications').select('*');
      const { data: profiles } = await supabase.from('profiles').select('*');

      reportData.verification = {
        oneci: verifications?.filter(v => v.oneci_status === 'verified').length || 0,
        cnam: verifications?.filter(v => v.cnam_status === 'verified').length || 0,
        face: verifications?.filter(v => v.face_verification_status === 'verified').length || 0,
        total: profiles?.length || 0,
      };
    }

    // Generate output based on format
    if (format === 'csv') {
      const csv = convertToCSV(reportData);
      return new Response(csv, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="report-${reportType}-${new Date().toISOString()}.csv"`,
        },
      });
    } else {
      // PDF format
      const pdfData = generatePDF(reportData, reportType);
      return new Response(JSON.stringify({ pdf: pdfData, reportData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error generating report:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: errorMessage === 'Unauthorized' ? 401 : errorMessage === 'Forbidden: Admin role required' ? 403 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function convertToCSV(data: any): string {
  const lines: string[] = [];

  if (data.performance) {
    lines.push('Performance de la plateforme');
    lines.push('Métrique,Valeur');
    lines.push(`Utilisateurs totaux,${data.performance.totalUsers}`);
    lines.push(`Biens totaux,${data.performance.totalProperties}`);
    lines.push(`Candidatures totales,${data.performance.totalApplications}`);
    lines.push('');
  }

  if (data.financial) {
    lines.push('Données financières');
    lines.push('Métrique,Valeur');
    lines.push(`Revenus totaux (FCFA),${data.financial.totalRevenue}`);
    lines.push(`Commission ANSUT 5% (FCFA),${data.financial.ansutCommission}`);
    lines.push(`Baux actifs,${data.financial.activeLeases}`);
    lines.push('');
    lines.push('Revenus par type de bien');
    lines.push('Type,Revenus (FCFA)');
    Object.entries(data.financial.revenueByType).forEach(([type, revenue]) => {
      lines.push(`${type},${revenue}`);
    });
    lines.push('');
  }

  if (data.verification) {
    lines.push('Statistiques de vérification');
    lines.push('Type,Vérifié,Total');
    lines.push(`ONECI,${data.verification.oneci},${data.verification.total}`);
    lines.push(`CNAM,${data.verification.cnam},${data.verification.total}`);
    lines.push(`Reconnaissance faciale,${data.verification.face},${data.verification.total}`);
  }

  return lines.join('\n');
}

function generatePDF(data: any, reportType: string): any {
  // Return structured data for PDF generation on client side
  // Client will use jsPDF to generate the actual PDF
  return {
    title: `Rapport ${reportType} - ANSUT`,
    date: new Date().toLocaleDateString('fr-FR'),
    sections: [
      data.performance && {
        title: 'Performance de la plateforme',
        metrics: [
          { label: 'Utilisateurs totaux', value: data.performance.totalUsers },
          { label: 'Biens totaux', value: data.performance.totalProperties },
          { label: 'Candidatures totales', value: data.performance.totalApplications },
        ],
      },
      data.financial && {
        title: 'Données financières',
        metrics: [
          { label: 'Revenus totaux', value: `${data.financial.totalRevenue.toLocaleString('fr-FR')} FCFA` },
          { label: 'Commission ANSUT (5%)', value: `${data.financial.ansutCommission.toLocaleString('fr-FR')} FCFA` },
          { label: 'Baux actifs', value: data.financial.activeLeases },
        ],
        table: {
          title: 'Revenus par type de bien',
          headers: ['Type de bien', 'Revenus (FCFA)'],
          rows: Object.entries(data.financial.revenueByType).map(([type, revenue]) => [
            type,
            (revenue as number).toLocaleString('fr-FR'),
          ]),
        },
      },
      data.verification && {
        title: 'Statistiques de vérification',
        table: {
          headers: ['Type de vérification', 'Vérifié', 'Total', 'Taux'],
          rows: [
            ['ONECI', data.verification.oneci, data.verification.total, `${Math.round((data.verification.oneci / data.verification.total) * 100)}%`],
            ['CNAM', data.verification.cnam, data.verification.total, `${Math.round((data.verification.cnam / data.verification.total) * 100)}%`],
            ['Reconnaissance faciale', data.verification.face, data.verification.total, `${Math.round((data.verification.face / data.verification.total) * 100)}%`],
          ],
        },
      },
    ].filter(Boolean),
  };
}
