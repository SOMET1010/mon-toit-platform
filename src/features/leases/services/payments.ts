/**
 * Service d'intégration Mobile Money (Orange Money, MTN Money, Moov Money)
 */

import { supabase } from '@/lib/supabase';
import type { PaymentRequest, PaymentResponse, PaymentStatus } from '../types';

/**
 * Initier un paiement Mobile Money
 */
export async function initiatePayment(
  request: PaymentRequest
): Promise<PaymentResponse> {
  try {
    // Appel à l'Edge Function Supabase qui gère les API Mobile Money
    const { data, error } = await supabase.functions.invoke('mobile-money-init', {
      body: {
        lease_id: request.lease_id,
        amount: request.amount,
        provider: request.provider,
        phone_number: request.phone_number,
      },
    });

    if (error) throw error;

    // Mettre à jour le bail avec le statut de paiement
    await supabase
      .from('leases')
      .update({
        payment_status: 'pending',
      })
      .eq('id', request.lease_id);

    return {
      success: true,
      transaction_id: data.transaction_id,
      status: 'pending',
    };
  } catch (error: any) {
    console.error('Erreur initiation paiement:', error);
    return {
      success: false,
      transaction_id: '',
      status: 'failed',
      error: error.message,
    };
  }
}

/**
 * Confirmer un paiement avec OTP
 */
export async function confirmPayment(
  transactionId: string,
  otp: string
): Promise<PaymentResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('mobile-money-confirm', {
      body: {
        transaction_id: transactionId,
        otp,
      },
    });

    if (error) throw error;

    return {
      success: true,
      transaction_id: transactionId,
      status: 'paid',
      receipt_url: data.receipt_url,
    };
  } catch (error: any) {
    console.error('Erreur confirmation paiement:', error);
    return {
      success: false,
      transaction_id: transactionId,
      status: 'failed',
      error: error.message,
    };
  }
}

/**
 * Vérifier le statut d'un paiement
 */
export async function checkPaymentStatus(
  transactionId: string
): Promise<PaymentResponse> {
  try {
    const { data, error } = await supabase.functions.invoke(
      'mobile-money-check-status',
      {
        body: { transaction_id: transactionId },
      }
    );

    if (error) throw error;

    return {
      success: true,
      transaction_id: transactionId,
      status: data.status,
      receipt_url: data.receipt_url,
    };
  } catch (error: any) {
    console.error('Erreur vérification statut paiement:', error);
    return {
      success: false,
      transaction_id: transactionId,
      status: 'failed',
      error: error.message,
    };
  }
}

/**
 * Webhook handler (appelé par les API Mobile Money après paiement)
 * Cette fonction est normalement dans une Edge Function Supabase
 */
export async function handlePaymentWebhook(payload: any): Promise<void> {
  const { transaction_id, status, lease_id, receipt_url } = payload;

  if (status === 'paid') {
    // Mettre à jour le bail
    await supabase
      .from('leases')
      .update({
        payment_status: 'paid',
        status: 'active', // Le bail devient actif après paiement
        updated_at: new Date().toISOString(),
      })
      .eq('id', lease_id);

    // Récupérer les infos du bail
    const { data: lease } = await supabase
      .from('leases')
      .select('landlord_id, tenant_id')
      .eq('id', lease_id)
      .single();

    if (!lease) {
      console.error('Bail non trouvé pour lease_id:', lease_id);
      return;
    }

    // Créer l'événement d'audit
    const leaseData = await supabase
      .from('leases')
      .select('*')
      .eq('id', lease_id)
      .single();

    const snapshot = JSON.stringify(leaseData.data);
    const hash = await generateHash(snapshot);

    await supabase.from('trusted_audit_trail').insert({
      lease_id,
      event: 'paid',
      actor: lease.tenant_id, // Le locataire a payé
      hash,
    });

    // Envoyer notifications push
    await sendPaymentNotifications(lease_id, lease.landlord_id, lease.tenant_id, receipt_url);
  } else if (status === 'failed') {
    // Mettre à jour le statut en échec
    await supabase
      .from('leases')
      .update({
        payment_status: 'failed',
      })
      .eq('id', lease_id);
  }
}

/**
 * Envoyer des notifications après paiement
 */
async function sendPaymentNotifications(
  leaseId: string,
  landlordId: string,
  tenantId: string,
  receiptUrl: string
): Promise<void> {
  // Notification au propriétaire
  await supabase.from('notifications').insert({
    user_id: landlordId,
    title: 'Paiement reçu !',
    message: 'Le locataire a effectué le paiement. Le bail est maintenant actif.',
    type: 'payment_received',
    data: { lease_id: leaseId, receipt_url: receiptUrl },
    deep_link: `mon-toit://baux/${leaseId}`,
  });

  // Notification au locataire
  await supabase.from('notifications').insert({
    user_id: tenantId,
    title: 'Paiement confirmé',
    message: 'Votre paiement a été confirmé. Le bail est maintenant actif.',
    type: 'payment_confirmed',
    data: { lease_id: leaseId, receipt_url: receiptUrl },
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
 * Configuration Mobile Money (à stocker dans Supabase secrets)
 */
export const MOBILE_MONEY_CONFIG = {
  orange: {
    apiUrl: 'https://api.orange.com/orange-money-webpay/ci/v1',
    merchantId: process.env.ORANGE_MONEY_MERCHANT_ID || '',
    apiKey: process.env.ORANGE_MONEY_API_KEY || '',
  },
  mtn: {
    apiUrl: 'https://sandbox.momodeveloper.mtn.com',
    subscriptionKey: process.env.MTN_SUBSCRIPTION_KEY || '',
    apiUser: process.env.MTN_API_USER || '',
    apiKey: process.env.MTN_API_KEY || '',
  },
  moov: {
    apiUrl: 'https://api.moov-africa.ci/v1',
    merchantId: process.env.MOOV_MERCHANT_ID || '',
    apiKey: process.env.MOOV_API_KEY || '',
  },
};

