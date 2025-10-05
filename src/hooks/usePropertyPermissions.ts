import { useAuth } from './useAuth';
import { ERROR_MESSAGES } from '@/constants';

/**
 * Hook for managing property-related permissions
 * Centralizes user type and ownership verification logic
 */
export const usePropertyPermissions = () => {
  const { user, profile, roles } = useAuth();

  /**
   * Check if user can manage properties (create, edit, delete)
   * Only 'proprietaire' and 'agence' can manage properties
   */
  const canManageProperties = (): boolean => {
    if (!user || !profile) return false;
    return profile.user_type === 'proprietaire' || profile.user_type === 'agence';
  };

  /**
   * Check if user can edit a specific property
   * User must be the owner or an agency managing the property
   */
  const canEditProperty = (ownerId: string): boolean => {
    if (!user || !profile) return false;
    if (!canManageProperties()) return false;
    return user.id === ownerId;
  };

  /**
   * Require owner access - throws error if user doesn't have permission
   * Used to protect pages/routes that require owner access
   */
  const requireOwnerAccess = (): { hasAccess: boolean; error?: string } => {
    if (!user) {
      return { hasAccess: false, error: ERROR_MESSAGES.AUTH_REQUIRED };
    }
    
    if (!profile) {
      return { hasAccess: false, error: ERROR_MESSAGES.SERVER_ERROR };
    }
    
    if (!canManageProperties()) {
      return { 
        hasAccess: false, 
        error: ERROR_MESSAGES.UNAUTHORIZED 
      };
    }
    
    return { hasAccess: true };
  };

  return {
    canManageProperties: canManageProperties(),
    canEditProperty,
    requireOwnerAccess,
    user,
    profile,
  };
};
