import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { welcomeTemplate } from "./_templates/welcome.ts";
import { paymentConfirmationTemplate } from "./_templates/payment-confirmation.ts";
import { paymentFailedTemplate } from "./_templates/payment-failed.ts";
import { certificationRequestedTemplate } from "./_templates/certification-requested.ts";
import { certificationApprovedTemplate } from "./_templates/certification-approved.ts";
import { certificationRejectedTemplate } from "./_templates/certification-rejected.ts";
import { newMessageTemplate } from "./_templates/new-message.ts";
import { leaseSignedTemplate } from "./_templates/lease-signed.ts";
import { verificationSuccessTemplate } from "./_templates/verification-success.ts";
import { faceVerificationSuccessTemplate } from "./_templates/face-verification-success.ts";
import { leaseContractGeneratedTemplate } from "./_templates/lease-contract-generated.ts";
import { roleChangeConfirmationTemplate, roleChangeConfirmationTextTemplate } from "./_templates/role-change-confirmation.ts";
import { guestMessageNotificationTemplate } from "./_templates/guest-message-notification.ts";
import { monthlyReportTemplate } from "./_templates/monthly-report.ts";

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
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    console.log(`Sending email to ${to} with template ${template}`);

    // Render the appropriate template
    let html: string;
    let textContent: string | undefined;
    switch (template) {
      case "welcome":
        html = welcomeTemplate(data);
        break;
      case "payment-confirmation":
        html = paymentConfirmationTemplate(data);
        break;
      case "payment-failed":
        html = paymentFailedTemplate(data);
        break;
      case "certification-requested":
        html = certificationRequestedTemplate(data);
        break;
      case "certification-approved":
        html = certificationApprovedTemplate(data);
        break;
      case "certification-rejected":
        html = certificationRejectedTemplate(data);
        break;
      case "new-message":
        html = newMessageTemplate(data);
        break;
      case "lease-signed":
        html = leaseSignedTemplate(data);
        break;
      case "verification-success":
        html = verificationSuccessTemplate(data);
        break;
      case "face-verification-success":
        html = faceVerificationSuccessTemplate(data);
        break;
      case "lease-contract-generated":
        html = leaseContractGeneratedTemplate(data);
        break;
      case "role-change-confirmation":
        html = roleChangeConfirmationTemplate(data);
        textContent = roleChangeConfirmationTextTemplate(data);
        break;
      case "guest-message-notification":
        html = guestMessageNotificationTemplate(data);
        break;
      case "monthly-report":
        html = monthlyReportTemplate(data);
        break;
      default:
        throw new Error(`Unknown template: ${template}`);
    }

    // Send email via Resend API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "MonToit ANSUT <no-reply@notifications.ansut.ci>",
        to: [to],
        subject: subject,
        html: html,
        text: textContent,
      }),
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.text();
      console.error("Resend API error:", error);
      throw new Error(`Resend API error: ${error}`);
    }

    const result = await resendResponse.json();
    console.log("Email sent successfully via Resend:", result);

    return new Response(JSON.stringify({ success: true, id: result.id }), {
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
