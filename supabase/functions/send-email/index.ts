import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { WelcomeEmail } from "./_templates/welcome.tsx";
import { PaymentConfirmationEmail } from "./_templates/payment-confirmation.tsx";
import { PaymentFailedEmail } from "./_templates/payment-failed.tsx";
import { CertificationRequestedEmail } from "./_templates/certification-requested.tsx";
import { CertificationApprovedEmail } from "./_templates/certification-approved.tsx";
import { CertificationRejectedEmail } from "./_templates/certification-rejected.tsx";
import { NewMessageEmail } from "./_templates/new-message.tsx";
import { LeaseSignedEmail } from "./_templates/lease-signed.tsx";
import { VerificationSuccessEmail } from "./_templates/verification-success.tsx";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  template: string;
  data: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, template, data }: EmailRequest = await req.json();
    const brevoApiKey = Deno.env.get("BREVO_API_KEY");

    if (!brevoApiKey) {
      throw new Error("BREVO_API_KEY not configured");
    }

    console.log(`Sending email to ${to} with template ${template}`);

    // Render the appropriate template
    let html: string;
    switch (template) {
      case "welcome":
        html = await renderAsync(React.createElement(WelcomeEmail, data));
        break;
      case "payment-confirmation":
        html = await renderAsync(React.createElement(PaymentConfirmationEmail, data));
        break;
      case "payment-failed":
        html = await renderAsync(React.createElement(PaymentFailedEmail, data));
        break;
      case "certification-requested":
        html = await renderAsync(React.createElement(CertificationRequestedEmail, data));
        break;
      case "certification-approved":
        html = await renderAsync(React.createElement(CertificationApprovedEmail, data));
        break;
      case "certification-rejected":
        html = await renderAsync(React.createElement(CertificationRejectedEmail, data));
        break;
      case "new-message":
        html = await renderAsync(React.createElement(NewMessageEmail, data));
        break;
      case "lease-signed":
        html = await renderAsync(React.createElement(LeaseSignedEmail, data));
        break;
      case "verification-success":
        html = await renderAsync(React.createElement(VerificationSuccessEmail, data));
        break;
      default:
        throw new Error(`Unknown template: ${template}`);
    }

    // Send email via Brevo API
    const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify({
        sender: {
          name: "MonToit ANSUT",
          email: "noreply@montoit.ci",
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html,
      }),
    });

    if (!brevoResponse.ok) {
      const error = await brevoResponse.text();
      console.error("Brevo API error:", error);
      throw new Error(`Brevo API error: ${error}`);
    }

    const result = await brevoResponse.json();
    console.log("Email sent successfully:", result);

    return new Response(JSON.stringify({ success: true, messageId: result.messageId }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-email function:", error);
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
