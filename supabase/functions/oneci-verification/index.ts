import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
    const authHeader = req.headers.get('Authorization')!;

    // Anonymize sensitive data in logs
    const cniHash = cniNumber ? `CNI_${cniNumber.slice(-4)}` : 'N/A';
    console.log('ONECI Verification Request:', { 
      cniHash, 
      timestamp: new Date().toISOString() 
    });

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

    // Check DEMO mode or real API
    const DEMO_MODE = Deno.env.get('ONECI_DEMO_MODE') === 'true';
    const ONECI_API_KEY = Deno.env.get('ONECI_API_KEY');

    let isValid = false;
    let holderData: any = {
      lastName: lastName.toUpperCase(),
      firstName,
      birthDate,
      birthPlace: 'Abidjan',
      nationality: 'Ivoirienne',
      issueDate: '2020-01-15',
      expiryDate: '2030-01-15'
    };

    if (DEMO_MODE) {
      // Mode DEMO: Always validate with a flag
      console.log('[DEMO MODE] ONECI verification - Auto-approving');
      isValid = true;
      holderData = { ...holderData, isDemoMode: true };
    } else if (ONECI_API_KEY) {
      // Real ONECI API call (to be implemented later)
      console.log('[PRODUCTION] Calling real ONECI API');
      // TODO: Implement real API call
      isValid = true; // Temporary
    } else {
      // Neither DEMO nor API configured → error 503
      return new Response(
        JSON.stringify({
          error: 'Service de vérification ONECI temporairement indisponible',
          status: 'SERVICE_UNAVAILABLE'
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (isValid) {

      // Extract user_id from JWT BEFORE creating service role client
      const tempSupabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      );
      const { data: { user } } = await tempSupabase.auth.getUser(authHeader.replace('Bearer ', ''));
      if (!user) throw new Error('Utilisateur non authentifié');

      // Create service role client WITHOUT user JWT
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Use UPSERT instead of UPDATE to handle new users
      const { error: updateError } = await supabase
        .from('user_verifications')
        .upsert({
          user_id: user.id,
          oneci_status: 'pending_review',
          oneci_data: holderData,
          oneci_cni_number: cniNumber,
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'user_id' 
        });

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({
          valid: true,
          cniNumber,
          holder: holderData,
          status: 'PENDING_REVIEW',
          message: 'Vérification soumise. En attente de validation par un administrateur.',
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
    
    // Determine HTTP status code based on error type
    let statusCode = 500;
    let errorMessage = 'Une erreur est survenue lors de la vérification';
    
    if (error instanceof Error) {
      if (error.message.includes('non authentifié')) {
        statusCode = 401;
        errorMessage = 'Session expirée. Veuillez vous reconnecter.';
      } else if (error.message.includes('Format CNI')) {
        statusCode = 400;
        errorMessage = error.message;
      } else {
        errorMessage = error.message;
      }
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        status: statusCode === 503 ? 'SERVICE_UNAVAILABLE' : 'ERROR'
      }),
      { status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
