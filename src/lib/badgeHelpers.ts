import type { ApplicationStatus, PropertyStatus, VerificationStatus } from '@/types';

/**
 * Badge helper utilities for consistent styling across the app
 */

// Property status mappings
export const propertyStatusLabels: Record<string, string> = {
  disponible: 'Disponible',
  loué: 'Loué',
  loue: 'Loué',
  en_attente: 'En attente',
  retiré: 'Retiré',
  retire: 'Retiré',
};

export const propertyStatusColors: Record<string, string> = {
  disponible: 'bg-green-500',
  loué: 'bg-blue-500',
  loue: 'bg-blue-500',
  en_attente: 'bg-yellow-500',
  retiré: 'bg-gray-500',
  retire: 'bg-gray-500',
};

// Application status mappings
export const applicationStatusLabels: Record<string, string> = {
  pending: 'En attente',
  approved: 'Approuvée',
  rejected: 'Rejetée',
  withdrawn: 'Retirée',
};

export const applicationStatusVariants: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  pending: 'secondary',
  approved: 'default',
  rejected: 'destructive',
  withdrawn: 'outline',
};

// Verification status mappings
export const verificationStatusLabels: Record<string, string> = {
  pending: 'En attente',
  verified: 'Vérifié',
  rejected: 'Rejeté',
  not_attempted: 'Non tenté',
};

export const verificationStatusVariants: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  pending: 'secondary',
  verified: 'default',
  rejected: 'destructive',
  not_attempted: 'outline',
};

/**
 * Get property status label
 */
export function getPropertyStatusLabel(status: string): string {
  return propertyStatusLabels[status] || status;
}

/**
 * Get property status color class
 */
export function getPropertyStatusColor(status: string): string {
  return propertyStatusColors[status] || 'bg-gray-500';
}

/**
 * Get application status label
 */
export function getApplicationStatusLabel(status: ApplicationStatus): string {
  return applicationStatusLabels[status] || status;
}

/**
 * Get application status variant
 */
export function getApplicationStatusVariant(
  status: ApplicationStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  return applicationStatusVariants[status] || 'outline';
}

/**
 * Get verification status label
 */
export function getVerificationStatusLabel(status: VerificationStatus): string {
  return verificationStatusLabels[status] || status;
}

/**
 * Get verification status variant
 */
export function getVerificationStatusVariant(
  status: VerificationStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  return verificationStatusVariants[status] || 'outline';
}

/**
 * Format price with FCFA currency
 */
export function formatPrice(price: number): string {
  return `${price.toLocaleString('fr-FR')} FCFA`;
}

/**
 * Format price per month
 */
export function formatMonthlyRent(rent: number): string {
  return `${formatPrice(rent)}/mois`;
}
