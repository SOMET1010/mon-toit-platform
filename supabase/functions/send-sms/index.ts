import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SMSRequest {
  to: string;           // Numéro de téléphone au format international (ex: +2250707070707)
  message: string;      // Contenu du SMS (max 160 caractères recommandé)
  sender?: string;      // Nom de l'expéditeur (max 11 caractères, optionnel)
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, message, sender }: SMSRequest = await req.json();
    
    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    if (!brevoApiKey) {
      throw new Error("BREVO_API_KEY not configured");
    }

    // Validation du numéro de téléphone
    if (!to || !to.startsWith('+')) {
      throw new Error("Le numéro de téléphone doit être au format international (ex: +2250707070707)");
    }

    // Validation du message
    if (!message || message.length === 0) {
      throw new Error("Le message ne peut pas être vide");
    }

    if (message.length > 160) {
      console.warn(`Message SMS trop long (${message.length} caractères). Il sera divisé en plusieurs SMS.`);
    }

    console.log(`Sending SMS to ${to}`);

    // Envoyer le SMS via Brevo API
    const brevoResponse = await fetch("https://api.brevo.com/v3/transactionalSMS/sms", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify({
        sender: sender || "MonToit",  // Nom de l'expéditeur (max 11 caractères)
        recipient: to,
        content: message,
        type: "transactional",
      }),
    });

    if (!brevoResponse.ok) {
      const error = await brevoResponse.text();
      console.error("Brevo SMS API error:", error);
      
      // Gestion des erreurs spécifiques
      if (brevoResponse.status === 402) {
        throw new Error("Crédits SMS insuffisants sur le compte Brevo");
      }
      if (brevoResponse.status === 400) {
        throw new Error("Numéro de téléphone invalide ou message incorrect");
      }
      
      throw new Error(`Brevo SMS API error: ${error}`);
    }

    const result = await brevoResponse.json();
    console.log("SMS sent successfully:", result);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: result.messageId,
        reference: result.reference,
        remainingCredits: result.remainingCredits 
      }), 
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-sms function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

