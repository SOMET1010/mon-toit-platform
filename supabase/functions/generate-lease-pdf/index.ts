import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import jsPDF from "https://esm.sh/jspdf@2.5.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeaseData {
  id: string;
  property_id: string;
  landlord_id: string;
  tenant_id: string;
  monthly_rent: number;
  deposit_amount: number;
  charges_amount: number;
  status: string;
  lease_type: string;
  start_date: string;
  end_date: string;
  tenant_signed_at: string | null;
  landlord_signed_at: string | null;
  ansut_certified_at: string | null;
  certification_status: string;
  properties: {
    title: string;
    address: string;
    city: string;
    neighborhood: string;
    property_type: string;
    surface_area: number;
    bedrooms: number;
    bathrooms: number;
  };
  landlord: {
    full_name: string;
    phone: string;
    id: string;
  };
  tenant: {
    full_name: string;
    phone: string;
    id: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { leaseId } = await req.json();

    if (!leaseId) {
      throw new Error('leaseId is required');
    }

    // Récupérer les données du bail
    const { data: lease, error: leaseError } = await supabaseClient
      .from('leases')
      .select(`
        *,
        properties (
          title, address, city, neighborhood, property_type,
          surface_area, bedrooms, bathrooms
        )
      `)
      .eq('id', leaseId)
      .single();

    if (leaseError) throw leaseError;

    // Récupérer les profils du propriétaire et locataire avec leurs emails
    const { data: landlord } = await supabaseClient
      .from('profiles')
      .select('id, full_name, phone')
      .eq('id', lease.landlord_id)
      .single();

    const { data: tenant } = await supabaseClient
      .from('profiles')
      .select('id, full_name, phone')
      .eq('id', lease.tenant_id)
      .single();
      
    // Récupérer les emails depuis auth.users
    const { data: { users: landlordUser } } = await supabaseClient.auth.admin.listUsers();
    const { data: { users: tenantUser } } = await supabaseClient.auth.admin.listUsers();
    
    const landlordEmail = landlordUser?.find(u => u.id === lease.landlord_id)?.email || '';
    const tenantEmail = tenantUser?.find(u => u.id === lease.tenant_id)?.email || '';

    const leaseData: LeaseData = {
      ...lease,
      landlord,
      tenant,
    };

    // Générer le PDF
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPos = 20;

    // En-tête
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CONTRAT DE BAIL', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Certification ANSUT si applicable
    if (leaseData.ansut_certified_at) {
      pdf.setFontSize(12);
      pdf.setTextColor(34, 139, 34);
      pdf.text('✓ CERTIFIÉ ANSUT', pageWidth / 2, yPos, { align: 'center' });
      pdf.setTextColor(0, 0, 0);
      yPos += 10;
    }

    // Numéro de contrat
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Numéro de contrat: ${leaseData.id}`, 20, yPos);
    yPos += 15;

    // Section: Les Parties
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('LES PARTIES', 20, yPos);
    yPos += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Propriétaire: ${leaseData.landlord.full_name}`, 25, yPos);
    yPos += 6;
    pdf.text(`Téléphone: ${leaseData.landlord.phone || 'Non renseigné'}`, 25, yPos);
    yPos += 10;

    pdf.text(`Locataire: ${leaseData.tenant.full_name}`, 25, yPos);
    yPos += 6;
    pdf.text(`Téléphone: ${leaseData.tenant.phone || 'Non renseigné'}`, 25, yPos);
    yPos += 15;

    // Section: Le Bien
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('LE BIEN IMMOBILIER', 20, yPos);
    yPos += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Désignation: ${leaseData.properties.title}`, 25, yPos);
    yPos += 6;
    pdf.text(`Type: ${leaseData.properties.property_type}`, 25, yPos);
    yPos += 6;
    pdf.text(`Adresse: ${leaseData.properties.address}, ${leaseData.properties.city}`, 25, yPos);
    yPos += 6;
    if (leaseData.properties.neighborhood) {
      pdf.text(`Quartier: ${leaseData.properties.neighborhood}`, 25, yPos);
      yPos += 6;
    }
    pdf.text(`Surface: ${leaseData.properties.surface_area || 'N/A'} m²`, 25, yPos);
    yPos += 6;
    pdf.text(`Chambres: ${leaseData.properties.bedrooms} | Salles de bain: ${leaseData.properties.bathrooms}`, 25, yPos);
    yPos += 15;

    // Section: Conditions Financières
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CONDITIONS FINANCIÈRES', 20, yPos);
    yPos += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Loyer mensuel: ${leaseData.monthly_rent.toLocaleString()} FCFA`, 25, yPos);
    yPos += 6;
    pdf.text(`Dépôt de garantie: ${leaseData.deposit_amount?.toLocaleString() || '0'} FCFA`, 25, yPos);
    yPos += 6;
    pdf.text(`Charges: ${leaseData.charges_amount?.toLocaleString() || '0'} FCFA`, 25, yPos);
    yPos += 15;

    // Section: Durée du Bail
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DURÉE DU BAIL', 20, yPos);
    yPos += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Type de bail: ${leaseData.lease_type}`, 25, yPos);
    yPos += 6;
    pdf.text(`Date de début: ${new Date(leaseData.start_date).toLocaleDateString('fr-FR')}`, 25, yPos);
    yPos += 6;
    pdf.text(`Date de fin: ${new Date(leaseData.end_date).toLocaleDateString('fr-FR')}`, 25, yPos);
    yPos += 15;

    // Section: Signatures
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SIGNATURES ÉLECTRONIQUES', 20, yPos);
    yPos += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    if (leaseData.landlord_signed_at) {
      pdf.text(`Propriétaire: Signé le ${new Date(leaseData.landlord_signed_at).toLocaleString('fr-FR')}`, 25, yPos);
      yPos += 6;
    }
    if (leaseData.tenant_signed_at) {
      pdf.text(`Locataire: Signé le ${new Date(leaseData.tenant_signed_at).toLocaleString('fr-FR')}`, 25, yPos);
      yPos += 6;
    }

    if (leaseData.ansut_certified_at) {
      yPos += 10;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(34, 139, 34);
      pdf.text('✓ CERTIFIÉ ANSUT', 25, yPos);
      yPos += 6;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Date de certification: ${new Date(leaseData.ansut_certified_at).toLocaleString('fr-FR')}`, 25, yPos);
      pdf.setTextColor(0, 0, 0);
    }

    // Pied de page
    const pageHeight = pdf.internal.pageSize.getHeight();
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text('Généré par MonToit ANSUT - Plateforme de location certifiée', pageWidth / 2, pageHeight - 15, { align: 'center' });
    pdf.text(`Document généré le ${new Date().toLocaleString('fr-FR')}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Convertir le PDF en bytes
    const pdfBytes = pdf.output('arraybuffer');
    const pdfBlob = new Uint8Array(pdfBytes);

    // Uploader dans le bucket
    const fileName = `leases/${leaseData.id}.pdf`;
    const { error: uploadError } = await supabaseClient
      .storage
      .from('lease-documents')
      .upload(fileName, pdfBlob, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Récupérer l'URL publique
    const { data: urlData } = supabaseClient
      .storage
      .from('lease-documents')
      .getPublicUrl(fileName);

    // Mettre à jour le bail avec l'URL du document
    const { error: updateError } = await supabaseClient
      .from('leases')
      .update({ document_url: urlData.publicUrl })
      .eq('id', leaseId);

    if (updateError) throw updateError;

    console.log(`PDF généré avec succès pour le bail ${leaseId}`);

    // Envoyer les emails aux deux parties
    try {
      // Email au propriétaire
      await supabaseClient.functions.invoke('send-email', {
        body: {
          to: landlordEmail,
          subject: 'Votre contrat de bail est disponible',
          template: 'lease-contract-generated',
          data: {
            recipientName: leaseData.landlord.full_name,
            propertyTitle: leaseData.properties.title,
            documentUrl: urlData.publicUrl,
            recipientType: 'landlord'
          }
        }
      });

      // Email au locataire
      await supabaseClient.functions.invoke('send-email', {
        body: {
          to: tenantEmail,
          subject: 'Votre contrat de bail est disponible',
          template: 'lease-contract-generated',
          data: {
            recipientName: leaseData.tenant.full_name,
            propertyTitle: leaseData.properties.title,
            documentUrl: urlData.publicUrl,
            recipientType: 'tenant'
          }
        }
      });
      
      console.log('Emails envoyés aux deux parties');
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi des emails:', emailError);
      // Ne pas faire échouer la génération si l'envoi d'email échoue
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        documentUrl: urlData.publicUrl,
        message: 'Contrat PDF généré avec succès'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});