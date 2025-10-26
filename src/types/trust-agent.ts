/**
 * Types pour les Agents de Confiance ANSUT
 * Les Agents de Confiance valident les résultats de vérification Smile ID
 */

export interface TrustAgent {
  id: string;
  user_id: string;
  agent_code: string; // Code unique ANSUT (ex: AC-2025-001)
  full_name: string;
  email: string;
  phone: string;
  certification_date: string;
  certification_expiry: string;
  is_active: boolean;
  region: string; // Région d'affectation
  total_validations: number;
  approved_validations: number;
  rejected_validations: number;
  pending_validations: number;
  created_at: string;
  updated_at: string;
}

export interface SmileIDVerificationResult {
  id: string;
  tenant_id: string;
  tenant_name: string;
  tenant_email: string;
  
  // Résultat Smile ID
  smile_id_job_id: string;
  smile_id_result: 'Verified' | 'Not Verified' | 'Pending';
  smile_id_confidence: number; // 0-100
  smile_id_similarity_score: number; // 0-100
  liveness_check: boolean;
  selfie_to_id_match: boolean;
  
  // Documents
  id_document_type: 'national_id' | 'passport' | 'drivers_license';
  id_document_number: string;
  id_document_image_url: string;
  selfie_image_url: string;
  
  // Statut de validation par l'Agent
  validation_status: 'pending' | 'approved' | 'rejected';
  validated_by?: string; // agent_id
  validated_at?: string;
  agent_notes?: string;
  rejection_reason?: string;
  
  // Métadonnées
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export interface AgentStats {
  total_pending: number;
  approved_today: number;
  approved_this_week: number;
  approved_this_month: number;
  rejected_this_month: number;
  average_processing_time: number; // en heures
  success_rate: number; // pourcentage
}

export interface AgentActivity {
  id: string;
  agent_id: string;
  action: 'validation_started' | 'approved' | 'rejected' | 'note_added';
  verification_id: string;
  tenant_name: string;
  details?: string;
  created_at: string;
}

export type ValidationStatus = 'pending' | 'approved' | 'rejected';
export type SmileIDResult = 'Verified' | 'Not Verified' | 'Pending';

