import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface MfaStatus {
  mfaEnabled: boolean;
  backupCodesCount: number;
  unusedCodesCount: number;
  mfaRequired: boolean;
  gracePeriodDays: number;
  loading: boolean;
}

export const useMfaStatus = () => {
  const { user, roles } = useAuth();
  const [status, setStatus] = useState<MfaStatus>({
    mfaEnabled: false,
    backupCodesCount: 0,
    unusedCodesCount: 0,
    mfaRequired: false,
    gracePeriodDays: 0,
    loading: true,
  });

  useEffect(() => {
    if (!user) {
      setStatus({
        mfaEnabled: false,
        backupCodesCount: 0,
        unusedCodesCount: 0,
        mfaRequired: false,
        gracePeriodDays: 0,
        loading: false,
      });
      return;
    }

    const fetchMfaStatus = async () => {
      try {
        // Check if MFA is enabled (check if user has backup codes)
        const { data: backupCodes, error: codesError } = await supabase
          .from('mfa_backup_codes')
          .select('id, used_at')
          .eq('user_id', user.id);

        if (codesError) throw codesError;

        const totalCodes = backupCodes?.length || 0;
        const unusedCodes = backupCodes?.filter(code => !code.used_at).length || 0;
        const hasMfa = totalCodes > 0;

        // Check MFA policy for user's roles
        let isRequired = false;
        let graceDays = 0;

        if (roles.length > 0) {
          // Filter valid app_role values
          const validRoles = roles.filter(role => 
            ['admin', 'super_admin', 'tiers_de_confiance', 'user'].includes(role)
          );

          if (validRoles.length > 0) {
            const { data: policies, error: policiesError } = await supabase
              .from('mfa_policies')
              .select('role, mfa_required, grace_period_days')
              .in('role', validRoles as any);

            if (policiesError) throw policiesError;

            // If any role requires MFA, it's required
            const requiredPolicy = policies?.find(p => p.mfa_required);
            if (requiredPolicy) {
              isRequired = true;
              graceDays = requiredPolicy.grace_period_days || 0;
            }
          }
        }

        setStatus({
          mfaEnabled: hasMfa,
          backupCodesCount: totalCodes,
          unusedCodesCount: unusedCodes,
          mfaRequired: isRequired,
          gracePeriodDays: graceDays,
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching MFA status:', error);
        setStatus(prev => ({ ...prev, loading: false }));
      }
    };

    fetchMfaStatus();
  }, [user, roles]);

  const refreshStatus = async () => {
    setStatus(prev => ({ ...prev, loading: true }));
    // Trigger re-fetch by updating a dependency
    if (user) {
      const { data: backupCodes } = await supabase
        .from('mfa_backup_codes')
        .select('id, used_at')
        .eq('user_id', user.id);

      const totalCodes = backupCodes?.length || 0;
      const unusedCodes = backupCodes?.filter(code => !code.used_at).length || 0;

      setStatus(prev => ({
        ...prev,
        mfaEnabled: totalCodes > 0,
        backupCodesCount: totalCodes,
        unusedCodesCount: unusedCodes,
        loading: false,
      }));
    }
  };

  return { ...status, refreshStatus };
};
