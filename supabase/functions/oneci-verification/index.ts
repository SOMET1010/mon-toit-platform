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
      const holderData = {
        lastName: lastName.toUpperCase(),
        firstName,
        birthDate,
        birthPlace: 'Abidjan',
        nationality: 'Ivoirienne',
        issueDate: '2020-01-15',
        expiryDate: '2030-01-15'
      };

      // Initialiser client Supabase
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      );

      // Récupérer l'ID utilisateur
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      // Mettre à jour la table user_verifications avec statut pending_review
      const { error: updateError } = await supabase
        .from('user_verifications')
        .update({
          oneci_status: 'pending_review',
          oneci_data: holderData,
          oneci_cni_number: cniNumber,
        })
        .eq('user_id', user.id);

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
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
