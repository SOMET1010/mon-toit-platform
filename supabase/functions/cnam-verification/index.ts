import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cniNumber, employerName, socialSecurityNumber } = await req.json();

    console.log('CNAM Verification Request:', { cniNumber, employerName, socialSecurityNumber });

    // Validation
    if (!cniNumber || !employerName) {
      return new Response(
        JSON.stringify({ error: 'CNI et employeur sont requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Simulation de vérification (90% de succès)
    const isValid = Math.random() < 0.90;

    await new Promise(resolve => setTimeout(resolve, 1500)); // Simule délai API

    if (isValid) {
      const employers = [
        'Orange Côte d\'Ivoire',
        'MTN Côte d\'Ivoire',
        'SODECI',
        'CIE',
        'Banque Atlantique',
        'SGI',
        'Air Côte d\'Ivoire'
      ];

      const randomEmployer = employers[Math.floor(Math.random() * employers.length)];
      const estimatedSalary = Math.floor(Math.random() * (1000000 - 200000) + 200000);

      return new Response(
        JSON.stringify({
          valid: true,
          cniNumber,
          employment: {
            employer: employerName || randomEmployer,
            socialSecurityNumber: socialSecurityNumber || `SS${Math.random().toString().slice(2, 8)}`,
            status: 'ACTIVE',
            contributionStatus: 'À JOUR',
            employmentType: 'CDI',
            estimatedMonthlySalary: estimatedSalary,
            lastContribution: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          },
          status: 'VERIFIED',
          verifiedAt: new Date().toISOString()
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({
          valid: false,
          error: 'Aucune information CNAM trouvée',
          status: 'FAILED'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in cnam-verification:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
