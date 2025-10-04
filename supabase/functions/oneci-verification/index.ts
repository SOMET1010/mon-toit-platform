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
    const { cniNumber, lastName, firstName, birthDate } = await req.json();

    console.log('ONECI Verification Request:', { cniNumber, lastName, firstName, birthDate });

    // Validation
    if (!cniNumber || !lastName || !firstName || !birthDate) {
      return new Response(
        JSON.stringify({ error: 'Tous les champs sont requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format CNI validation (CI + 10 chiffres)
    const cniRegex = /^CI\d{10}$/;
    if (!cniRegex.test(cniNumber)) {
      return new Response(
        JSON.stringify({ 
          valid: false,
          error: 'Format CNI invalide. Attendu: CI + 10 chiffres'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Simulation de vérification (95% de succès)
    const isValid = Math.random() < 0.95;

    await new Promise(resolve => setTimeout(resolve, 2000)); // Simule délai API

    if (isValid) {
      return new Response(
        JSON.stringify({
          valid: true,
          cniNumber,
          holder: {
            lastName: lastName.toUpperCase(),
            firstName,
            birthDate,
            birthPlace: 'Abidjan',
            nationality: 'Ivoirienne',
            issueDate: '2020-01-15',
            expiryDate: '2030-01-15'
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
          error: 'CNI non trouvée dans la base ONECI',
          status: 'FAILED'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in oneci-verification:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
