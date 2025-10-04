import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, phoneNumber, provider, leaseId, paymentType } = await req.json();

    console.log('Mobile Money Payment Request:', { amount, phoneNumber, provider, paymentType });

    // Validation
    if (!amount || !phoneNumber || !provider) {
      return new Response(
        JSON.stringify({ error: 'Montant, numéro et provider requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validation du provider
    const validProviders = ['orange_money', 'mtn_money', 'wave'];
    if (!validProviders.includes(provider)) {
      return new Response(
        JSON.stringify({ error: 'Provider invalide' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validation du numéro selon le provider
    const phoneValidation: any = {
      orange_money: /^07\d{8}$/,
      mtn_money: /^0[56]\d{8}$/,
      wave: /^\d{8}$/
    };

    if (!phoneValidation[provider].test(phoneNumber)) {
      return new Response(
        JSON.stringify({ error: 'Format de numéro invalide pour ce provider' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calcul des frais (1% du montant)
    const fees = amount * 0.01;
    const totalAmount = amount + fees;

    // Simulation de transaction (95% de succès)
    const isSuccess = Math.random() < 0.95;

    await new Promise(resolve => setTimeout(resolve, 3000)); // Simule délai traitement

    const transactionRef = `MM${Date.now()}${Math.random().toString(36).substring(7).toUpperCase()}`;

    if (isSuccess) {
      // Créer la transaction dans la base
      const { data: transaction, error } = await supabase
        .from('mobile_money_transactions')
        .insert({
          provider,
          phone_number: phoneNumber,
          transaction_ref: transactionRef,
          amount,
          fees,
          status: 'success',
          provider_response: {
            message: 'Paiement effectué avec succès',
            transactionId: transactionRef,
            timestamp: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      return new Response(
        JSON.stringify({
          success: true,
          transactionRef,
          amount,
          fees,
          totalAmount,
          provider,
          status: 'success',
          message: `Paiement de ${amount.toLocaleString()} FCFA effectué avec succès via ${provider.replace('_', ' ')}`,
          timestamp: new Date().toISOString()
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Transaction échouée. Vérifiez votre solde ou réessayez.',
          status: 'failed'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in mobile-money-payment:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
