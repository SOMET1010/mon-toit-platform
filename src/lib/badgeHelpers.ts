import type { ApplicationStatus, PropertyStatus, VerificationStatus } from '@/types';
import {
  PROPERTY_STATUS_LABELS,
  PROPERTY_STATUS_COLORS,
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_VARIANTS,
  VERIFICATION_STATUS_LABELS,
  VERIFICATION_STATUS_VARIANTS,
  formatPrice,
  formatMonthlyRent,
} from '@/constants';

/**
 * Badge helper utilities for consistent styling across the app
 * All constants are now imported from @/constants for centralized management
 */

// Re-export for backward compatibility
export const propertyStatusLabels = PROPERTY_STATUS_LABELS;
export const propertyStatusColors = PROPERTY_STATUS_COLORS;
export const applicationStatusLabels = APPLICATION_STATUS_LABELS;
export const applicationStatusVariants = APPLICATION_STATUS_VARIANTS;
export const verificationStatusLabels = VERIFICATION_STATUS_LABELS;
export const verificationStatusVariants = VERIFICATION_STATUS_VARIANTS;

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

// Re-export formatPrice and formatMonthlyRent from constants
export { formatPrice, formatMonthlyRent };
