/**
 * Service d'intégration Cryptoneo / PSE pour la signature électronique
 */

import { supabase } from '@/lib/supabase';
import type { SignatureRequest, SignatureResponse } from '../types';

/**
 * Initier une signature électronique
 */
export async function initiateSignature(
  request: SignatureRequest
): Promise<SignatureResponse> {
  try {
    // Appel à l'Edge Function Supabase qui gère Cryptoneo
    const { data, error } = await supabase.functions.invoke('cryptoneo-sign', {
      body: {
        lease_id: request.lease_id,
        signer_id: request.signer_id,
        signer_role: request.signer_role,
        document_url: request.document_url,
      },
    });

    if (error) throw error;

    // Mettre à jour le bail avec l'operation_id
    await supabase
      .from('leases')
      .update({
        cryptoneo_operation_id: data.operation_id,
        cryptoneo_signature_status: 'pending',
        status: 'awaiting_signature',
      })
      .eq('id', request.lease_id);

    return {
      success: true,
      operation_id: data.operation_id,
      signature_url: data.signature_url,
      status: 'pending',
    };
  } catch (error: any) {
    console.error('Erreur initiation signature:', error);
    return {
      success: false,
      operation_id: '',
      signature_url: '',
      status: 'failed',
      error: error.message,
    };
  }
}

/**
 * Vérifier le statut d'une signature
 */
export async function checkSignatureStatus(
  operationId: string
): Promise<SignatureResponse> {
  try {
    const { data, error } = await supabase.functions.invoke(
      'cryptoneo-check-status',
      {
        body: { operation_id: operationId },
      }
    );

    if (error) throw error;

    return {
      success: true,
      operation_id: operationId,
      signature_url: data.signed_document_url || '',
      status: data.status,
    };
  } catch (error: any) {
    console.error('Erreur vérification statut signature:', error);
    return {
      success: false,
      operation_id: operationId,
      signature_url: '',
      status: 'failed',
      error: error.message,
    };
  }
}

/**
 * Webhook handler (appelé par Cryptoneo après signature)
 * Cette fonction est normalement dans une Edge Function Supabase
 */
export async function handleSignatureWebhook(payload: any): Promise<void> {
  const { operation_id, status, signed_document_url } = payload;

  if (status === 'completed') {
    // Récupérer le bail associé
    const { data: lease } = await supabase
      .from('leases')
      .select('id, landlord_id, tenant_id')
      .eq('cryptoneo_operation_id', operation_id)
      .single();

    if (!lease) {
      console.error('Bail non trouvé pour operation_id:', operation_id);
      return;
    }

    // Mettre à jour le bail
    await supabase
      .from('leases')
      .update({
        cryptoneo_signature_status: 'completed',
        signed_document_url,
        status: 'signed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', lease.id);

    // Créer l'événement d'audit
    const leaseData = await supabase
      .from('leases')
      .select('*')
      .eq('id', lease.id)
      .single();

    const snapshot = JSON.stringify(leaseData.data);
    const hash = await generateHash(snapshot);

    await supabase.from('trusted_audit_trail').insert({
      lease_id: lease.id,
      event: 'signed',
      actor: lease.landlord_id, // ou tenant_id selon qui a signé
      hash,
    });

    // Envoyer notifications push
    await sendSignatureNotifications(lease.id, lease.landlord_id, lease.tenant_id);
  } else if (status === 'failed') {
    // Mettre à jour le statut en échec
    await supabase
      .from('leases')
      .update({
        cryptoneo_signature_status: 'failed',
      })
      .eq('cryptoneo_operation_id', operation_id);
  }
}

/**
 * Envoyer des notifications après signature
 */
async function sendSignatureNotifications(
  leaseId: string,
  landlordId: string,
  tenantId: string
): Promise<void> {
  // Notification au propriétaire
  await supabase.from('notifications').insert({
    user_id: landlordId,
    title: 'Bail signé avec succès',
    message: 'Le bail a été signé électroniquement. Vous pouvez maintenant procéder au paiement.',
    type: 'lease_signed',
    data: { lease_id: leaseId },
    deep_link: `mon-toit://baux/${leaseId}`,
  });

  // Notification au locataire
  await supabase.from('notifications').insert({
    user_id: tenantId,
    title: 'Bail signé avec succès',
    message: 'Le bail a été signé électroniquement. Le propriétaire peut maintenant procéder au paiement.',
    type: 'lease_signed',
    data: { lease_id: leaseId },
    deep_link: `mon-toit://baux/${leaseId}`,
  });
}

/**
 * Générer un hash SHA256
 */
async function generateHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Configuration Cryptoneo (à stocker dans Supabase secrets)
 */
export const CRYPTONEO_CONFIG = {
  apiUrl: 'https://api.cryptoneo.ci/v1', // URL fictive
  apiKey: process.env.CRYPTONEO_API_KEY || '',
  webhookSecret: process.env.CRYPTONEO_WEBHOOK_SECRET || '',
};

