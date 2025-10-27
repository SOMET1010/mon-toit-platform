/**
 * Service API pour la gestion des baux électroniques
 */

import { supabase } from '@/lib/supabase';
import type { Lease, LeaseFormData, AuditTrailEvent } from '../types';

/**
 * Récupérer tous les baux de l'utilisateur connecté
 */
export async function getMyLeases(): Promise<Lease[]> {
  const { data, error } = await supabase
    .from('leases')
    .select(`
      *,
      property:properties(id, title, address, city, images),
      landlord:profiles!landlord_id(id, full_name, email, phone),
      tenant:profiles!tenant_id(id, full_name, email, phone)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Lease[];
}

/**
 * Récupérer un bail par ID
 */
export async function getLeaseById(leaseId: string): Promise<Lease> {
  const { data, error } = await supabase
    .from('leases')
    .select(`
      *,
      property:properties(id, title, address, city, images),
      landlord:profiles!landlord_id(id, full_name, email, phone),
      tenant:profiles!tenant_id(id, full_name, email, phone)
    `)
    .eq('id', leaseId)
    .single();

  if (error) throw error;
  return data as Lease;
}

/**
 * Créer un nouveau bail (brouillon)
 */
export async function createLease(formData: LeaseFormData): Promise<Lease> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { data, error } = await supabase
    .from('leases')
    .insert({
      property_id: formData.property_id,
      landlord_id: user.id,
      tenant_id: formData.tenant_id,
      rent_amount: formData.rent_amount,
      deposit_amount: formData.deposit_amount,
      start_date: formData.start_date,
      end_date: formData.end_date,
      status: 'draft',
      payment_status: 'unpaid',
    })
    .select()
    .single();

  if (error) throw error;
  
  // Créer l'événement d'audit
  await createAuditEvent(data.id, 'created', user.id);
  
  return data as Lease;
}

/**
 * Mettre à jour un bail
 */
export async function updateLease(
  leaseId: string,
  updates: Partial<Lease>
): Promise<Lease> {
  const { data, error } = await supabase
    .from('leases')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', leaseId)
    .select()
    .single();

  if (error) throw error;
  return data as Lease;
}

/**
 * Changer le statut d'un bail
 */
export async function updateLeaseStatus(
  leaseId: string,
  status: Lease['status']
): Promise<Lease> {
  return updateLease(leaseId, { status });
}

/**
 * Générer le PDF du bail
 */
export async function generateLeasePDF(leaseId: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke('generate-lease-pdf', {
    body: { lease_id: leaseId },
  });

  if (error) throw error;
  return data.pdf_url;
}

/**
 * Vérifier un bail (Tiers de Confiance)
 */
export async function verifyLease(leaseId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { error } = await supabase.rpc('verify_contract', {
    p_lease_id: leaseId,
  });

  if (error) throw error;

  // Créer l'événement d'audit
  await createAuditEvent(leaseId, 'verified', user.id);
}

/**
 * Annuler un bail
 */
export async function cancelLease(leaseId: string): Promise<Lease> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const lease = await updateLeaseStatus(leaseId, 'cancelled');
  
  // Créer l'événement d'audit
  await createAuditEvent(leaseId, 'cancelled', user.id);
  
  return lease;
}

/**
 * Récupérer l'historique d'audit d'un bail
 */
export async function getLeaseAuditTrail(
  leaseId: string
): Promise<AuditTrailEvent[]> {
  const { data, error } = await supabase
    .from('trusted_audit_trail')
    .select('*')
    .eq('lease_id', leaseId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as AuditTrailEvent[];
}

/**
 * Créer un événement d'audit
 */
async function createAuditEvent(
  leaseId: string,
  event: AuditTrailEvent['event'],
  actorId: string
): Promise<void> {
  // Générer un hash SHA256 du snapshot
  const lease = await getLeaseById(leaseId);
  const snapshot = JSON.stringify(lease);
  const hash = await generateHash(snapshot);

  const { error } = await supabase
    .from('trusted_audit_trail')
    .insert({
      lease_id: leaseId,
      event,
      actor: actorId,
      hash,
    });

  if (error) throw error;
}

/**
 * Générer un hash SHA256
 */
async function generateHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

