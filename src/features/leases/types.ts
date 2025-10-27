/**
 * Types TypeScript pour le module Bail Électronique
 */

export type LeaseStatus = 
  | 'draft' 
  | 'awaiting_signature' 
  | 'signed' 
  | 'paid' 
  | 'active' 
  | 'cancelled';

export type PaymentStatus = 
  | 'unpaid' 
  | 'pending' 
  | 'paid' 
  | 'failed';

export type SignatureStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed';

export interface Lease {
  id: string;
  property_id: string;
  landlord_id: string;
  tenant_id: string;
  rent_amount: number;
  deposit_amount: number;
  currency: string;
  start_date: string;
  end_date: string | null;
  status: LeaseStatus;
  pdf_url: string | null;
  signed_document_url: string | null;
  cryptoneo_operation_id: string | null;
  cryptoneo_signature_status: SignatureStatus | null;
  payment_status: PaymentStatus;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
  
  // Relations (populated via joins)
  property?: {
    id: string;
    title: string;
    address: string;
    city: string;
    images: string[];
  };
  landlord?: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
  };
  tenant?: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
  };
}

export interface LeaseFormData {
  property_id: string;
  tenant_id: string;
  rent_amount: number;
  deposit_amount: number;
  start_date: string;
  end_date: string | null;
  clauses: LeaseClause[];
  attachments: LeaseAttachment[];
}

export interface LeaseClause {
  id: string;
  title: string;
  content: string;
  is_mandatory: boolean;
  is_selected: boolean;
}

export interface LeaseAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface AuditTrailEvent {
  id: string;
  lease_id: string;
  event: 'created' | 'signed' | 'paid' | 'verified' | 'cancelled';
  actor: string;
  hash: string;
  created_at: string;
}

export interface PaymentRequest {
  lease_id: string;
  amount: number;
  provider: 'orange_money' | 'mtn_money' | 'moov_money';
  phone_number: string;
}

export interface PaymentResponse {
  success: boolean;
  transaction_id: string;
  status: PaymentStatus;
  receipt_url?: string;
  error?: string;
}

export interface SignatureRequest {
  lease_id: string;
  signer_id: string;
  signer_role: 'landlord' | 'tenant';
  document_url: string;
}

export interface SignatureResponse {
  success: boolean;
  operation_id: string;
  signature_url: string;
  status: SignatureStatus;
  error?: string;
}

