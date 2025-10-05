import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SmileIDRequest {
  cniImageBase64: string;
  selfieBase64: string;
}

// Generate HMAC-SHA256 signature for Smile ID
async function generateSignature(timestamp: string, partnerId: string, apiKey: string): Promise<string> {
  const message = `${timestamp}${partnerId}sid_request`;
  const encoder = new TextEncoder();
  const keyData = encoder.encode(apiKey);
  const messageData = encoder.encode(message);
  
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", key, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cniImageBase64, selfieBase64 }: SmileIDRequest = await req.json();
    
    console.log('Smile ID Verification Request received');

    // Get Smile ID configuration
    const partnerId = Deno.env.get('SMILE_ID_PARTNER_ID')!;
    const apiKey = Deno.env.get('SMILE_ID_API_KEY')!;
    const environment = Deno.env.get('SMILE_ID_ENVIRONMENT') || 'test';
    
    const baseUrl = environment === 'production' 
      ? 'https://api.smileidentity.com/v1'
      : 'https://testapi.smileidentity.com/v1';

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user (JWT automatically verified by Supabase since verify_jwt = true)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('Unauthorized');
    }

    // Check verification attempts (max 3 per day)
    const { data: verification } = await supabase
      .from('user_verifications')
      .select('face_verification_attempts, updated_at')
      .eq('user_id', user.id)
      .maybeSingle();

    const today = new Date().toDateString();
    const lastAttempt = verification?.updated_at 
      ? new Date(verification.updated_at).toDateString() 
      : null;
    
    if (lastAttempt === today && verification && verification.face_verification_attempts >= 3) {
      return new Response(
        JSON.stringify({ 
          error: 'Limite de tentatives atteinte',
          message: 'Vous avez atteint la limite de 3 tentatives par jour. Réessayez demain.' 
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate timestamp and signature
    const timestamp = new Date().toISOString();
    const signature = await generateSignature(timestamp, partnerId, apiKey);

    // Prepare Smile ID request payload
    const smileIdPayload = {
      partner_id: partnerId,
      timestamp: timestamp,
      signature: signature,
      country: "CI", // Côte d'Ivoire
      id_type: "NATIONAL_ID",
      id_number: "", // Will be extracted
      job_type: 5, // Enhanced Document Verification
      user_id: user.id,
      images: [
        {
          image_type_id: 1, // Selfie
          image: selfieBase64.split(',')[1], // Remove data:image prefix
        },
        {
          image_type_id: 3, // ID Card
          image: cniImageBase64.split(',')[1],
        }
      ],
      partner_params: {
        user_id: user.id,
        job_id: crypto.randomUUID(),
      }
    };

    console.log('Calling Smile ID API...');

    // Call Smile ID API
    const smileResponse = await fetch(`${baseUrl}/id_verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(smileIdPayload),
    });

    if (!smileResponse.ok) {
      const errorText = await smileResponse.text();
      console.error('Smile ID API error:', smileResponse.status, errorText);
      throw new Error(`Erreur Smile ID API: ${smileResponse.status}`);
    }

    const smileResult = await smileResponse.json();
    console.log('Smile ID result:', JSON.stringify(smileResult, null, 2));

    // Extract results
    const resultCode = smileResult.ResultCode || smileResult.result_code || '';
    const resultText = smileResult.ResultText || smileResult.result_text || '';
    const actions = smileResult.Actions || smileResult.actions || {};
    const confidenceValue = parseFloat(smileResult.ConfidenceValue || smileResult.confidence_value || 0);
    
    // Parse actions
    const livenessCheck = actions.Liveness_Check === 'Passed' || actions.liveness_check === 'Passed';
    const selfieToIdMatch = actions.Selfie_To_ID_Authority_Compare === 'Passed' 
      || actions.selfie_to_id_authority_compare === 'Passed'
      || actions.Selfie_To_ID_Card_Compare === 'Passed'
      || actions.selfie_to_id_card_compare === 'Passed';
    
    // Extract ID number from result
    const idNumber = smileResult.IDNumber || smileResult.id_number || '';

    // Determine if verification passed
    const isVerified = (resultCode === '1' || resultCode === '0') 
      && livenessCheck 
      && selfieToIdMatch 
      && confidenceValue >= 70;

    // Update attempts
    const newAttempts = lastAttempt === today 
      ? (verification?.face_verification_attempts || 0) + 1 
      : 1;

    // Prepare update data
    const updateData: any = {
      face_verification_attempts: newAttempts,
      face_similarity_score: confidenceValue,
      smile_id_job_id: smileResult.job_id || smileIdPayload.partner_params.job_id,
      smile_id_result_code: resultCode,
      smile_id_confidence_score: confidenceValue,
      smile_id_actions: actions,
      id_number_extracted: idNumber,
      liveness_check_passed: livenessCheck,
      selfie_to_id_match_passed: selfieToIdMatch,
    };

    if (isVerified) {
      updateData.face_verification_status = 'verified';
      updateData.face_verified_at = new Date().toISOString();
    } else {
      updateData.face_verification_status = 'failed';
    }

    const { error: updateError } = await supabase
      .from('user_verifications')
      .update(updateData)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating verification:', updateError);
    }

    // Send success email if verified
    if (isVerified) {
      await supabase.functions.invoke('send-email', {
        body: {
          type: 'face-verification-success',
          to: user.email,
          data: {
            userName: user.user_metadata?.full_name || 'Utilisateur',
            similarityScore: confidenceValue.toFixed(1),
          }
        }
      });
    }

    return new Response(
      JSON.stringify({
        verified: isVerified,
        similarityScore: confidenceValue.toFixed(1),
        livenessCheck: livenessCheck,
        selfieToIdMatch: selfieToIdMatch,
        idNumber: idNumber,
        resultText: resultText,
        message: isVerified 
          ? 'Vérification Smile ID réussie !' 
          : `Vérification échouée. ${resultText}`,
        attemptsRemaining: Math.max(0, 3 - newAttempts),
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in smile-id-verification:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        verified: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
