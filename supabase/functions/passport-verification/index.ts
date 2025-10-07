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
    const { 
      passportNumber, 
      nationality, 
      firstName, 
      lastName, 
      birthDate,
      issueDate,
      expiryDate 
    } = await req.json();
    const authHeader = req.headers.get('Authorization')!;

    // Anonymize sensitive data in logs
    const passportHash = passportNumber ? `PASS_${passportNumber.slice(-4)}` : 'N/A';
    console.log('Passport Verification Request:', { 
      passportHash,
      nationality,
      timestamp: new Date().toISOString() 
    });

    // Validation des champs requis
    if (!passportNumber || !nationality || !firstName || !lastName || !birthDate || !issueDate || !expiryDate) {
      return new Response(
        JSON.stringify({ error: 'Tous les champs sont requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validation des dates
    const birth = new Date(birthDate);
    const issue = new Date(issueDate);
    const expiry = new Date(expiryDate);
    const now = new Date();

    if (birth > now) {
      return new Response(
        JSON.stringify({ 
          valid: false,
          error: 'Date de naissance invalide'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (expiry < now) {
      return new Response(
        JSON.stringify({ 
          valid: false,
          error: 'Passeport expiré'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (issue > now || issue < birth) {
      return new Response(
        JSON.stringify({ 
          valid: false,
          error: 'Date d\'émission invalide'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mode DEMO: Toujours valider
    console.log('[DEMO MODE] Passport verification - Auto-approving');
    const holderData = {
      lastName: lastName.toUpperCase(),
      firstName,
      birthDate,
      nationality,
      issueDate,
      expiryDate,
      isDemoMode: true
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Extract user_id from JWT
    const tempSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );
    const { data: { user } } = await tempSupabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) throw new Error('Utilisateur non authentifié');

    // Create service role client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // UPSERT passport verification data
    const { error: updateError } = await supabase
      .from('user_verifications')
      .upsert({
        user_id: user.id,
        passport_status: 'pending_review',
        passport_data: holderData,
        passport_number: passportNumber,
        passport_nationality: nationality,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'user_id' 
      });

    if (updateError) throw updateError;

    // Update nationality in profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ nationality })
      .eq('id', user.id);

    if (profileError) console.error('Profile update error:', profileError);

    return new Response(
      JSON.stringify({
        valid: true,
        passportNumber,
        holder: holderData,
        status: 'PENDING_REVIEW',
        message: 'Vérification soumise. En attente de validation par un administrateur.',
        verifiedAt: new Date().toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in passport-verification:', error);
    
    let statusCode = 500;
    let errorMessage = 'Une erreur est survenue lors de la vérification';
    
    if (error instanceof Error) {
      if (error.message.includes('non authentifié')) {
        statusCode = 401;
        errorMessage = 'Session expirée. Veuillez vous reconnecter.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        status: 'ERROR'
      }),
      { status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});