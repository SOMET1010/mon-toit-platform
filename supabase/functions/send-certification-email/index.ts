import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  leaseId: string;
  action: 'approved' | 'rejected' | 'request_changes';
  notes?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { leaseId, action, notes }: EmailRequest = await req.json();

    // Récupérer les informations du bail
    const { data: lease, error: leaseError } = await supabase
      .from('leases')
      .select(`
        *,
        properties (title, address, city),
        landlord:landlord_id (full_name, id),
        tenant:tenant_id (full_name, id)
      `)
      .eq('id', leaseId)
      .single();

    if (leaseError) throw leaseError;

    // Récupérer les emails depuis auth.users
    const { data: { user: landlordUser } } = await supabase.auth.admin.getUserById(
      lease.landlord.id
    );
    const { data: { user: tenantUser } } = await supabase.auth.admin.getUserById(
      lease.tenant.id
    );

    if (!landlordUser?.email || !tenantUser?.email) {
      throw new Error('Emails introuvables');
    }

    let subject = '';
    let htmlContent = '';

    if (action === 'approved') {
      subject = '✅ Bail certifié par ANSUT';
      htmlContent = `
        <h1>Félicitations ! Votre bail a été certifié par ANSUT</h1>
        <p>Bonjour,</p>
        <p>Nous avons le plaisir de vous informer que votre bail pour le bien suivant a été certifié par ANSUT :</p>
        <p><strong>${lease.properties.title}</strong><br>
        ${lease.properties.address}, ${lease.properties.city}</p>
        <p>Cette certification garantit la conformité de votre contrat avec les normes ivoiriennes.</p>
        <p>Vous pouvez dès maintenant télécharger votre contrat certifié depuis votre espace Mon Toit.</p>
        <p>Cordialement,<br>L'équipe ANSUT</p>
      `;
    } else if (action === 'rejected') {
      subject = '❌ Demande de certification refusée';
      htmlContent = `
        <h1>Demande de certification refusée</h1>
        <p>Bonjour,</p>
        <p>Votre demande de certification pour le bail suivant a été refusée :</p>
        <p><strong>${lease.properties.title}</strong><br>
        ${lease.properties.address}, ${lease.properties.city}</p>
        ${notes ? `<p><strong>Motif :</strong> ${notes}</p>` : ''}
        <p>Veuillez corriger les éléments mentionnés et soumettre une nouvelle demande.</p>
        <p>Cordialement,<br>L'équipe ANSUT</p>
      `;
    } else if (action === 'request_changes') {
      subject = '⚠️ Modifications demandées pour la certification';
      htmlContent = `
        <h1>Modifications demandées pour votre bail</h1>
        <p>Bonjour,</p>
        <p>Des modifications sont nécessaires pour certifier votre bail :</p>
        <p><strong>${lease.properties.title}</strong><br>
        ${lease.properties.address}, ${lease.properties.city}</p>
        ${notes ? `<p><strong>Modifications demandées :</strong> ${notes}</p>` : ''}
        <p>Veuillez effectuer les modifications nécessaires puis soumettre une nouvelle demande.</p>
        <p>Cordialement,<br>L'équipe ANSUT</p>
      `;
    }

    // Envoyer l'email via Brevo (SendInBlue)
    const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY!,
      },
      body: JSON.stringify({
        sender: {
          name: 'Mon Toit - ANSUT',
          email: 'noreply@montoit.ci',
        },
        to: [
          { email: landlordUser.email, name: lease.landlord.full_name },
          { email: tenantUser.email, name: lease.tenant.full_name },
        ],
        subject,
        htmlContent,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error('Brevo API error:', errorData);
      throw new Error(`Erreur d'envoi email: ${emailResponse.status}`);
    }

    console.log('Certification email sent successfully:', {
      leaseId,
      action,
      recipients: [landlordUser.email, tenantUser.email],
    });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in send-certification-email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
