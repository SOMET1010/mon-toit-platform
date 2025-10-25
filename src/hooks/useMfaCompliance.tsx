import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/services/logger';

export interface MfaComplianceStatus {
  user_id: string;
  full_name: string;
  role: 'admin' | 'super_admin';
  has_mfa: boolean;
  account_created_at: string;
  grace_period_expires_at: string;
  is_compliant: boolean;
  days_remaining: number;
  status: 'compliant' | 'warning' | 'critical';
}

export const useMfaCompliance = () => {
  const [admins, setAdmins] = useState<MfaComplianceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const calculateStatus = (admin: any): MfaComplianceStatus => {
    const expiresAt = new Date(admin.grace_period_expires_at);
    const now = new Date();
    const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    let status: 'compliant' | 'warning' | 'critical';
    if (admin.has_mfa) {
      status = 'compliant';
    } else if (daysRemaining < 0) {
      status = 'critical';
    } else if (daysRemaining <= 3) {
      status = 'warning';
    } else {
      status = 'compliant';
    }

    return {
      ...admin,
      days_remaining: Math.max(0, daysRemaining),
      status,
    };
  };

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try RPC first, fallback to direct queries
      let data = null;
      const { data: rpcData, error: rpcError } = await supabase.rpc('check_admin_mfa_compliance');

      if (!rpcError && rpcData) {
        data = rpcData;
      } else {
        // Fallback: fetch data directly from tables
        console.warn('RPC check_admin_mfa_compliance not found, using fallback queries');

        // Get all admin users
        const { data: adminRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .in('role', ['admin', 'super_admin']);

        if (rolesError) throw rolesError;

        if (!adminRoles || adminRoles.length === 0) {
          data = [];
        } else {
          // For each admin, get their profile and MFA status
          const adminData = await Promise.all(
            adminRoles.map(async (adminRole) => {
              // Get profile
              const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, created_at')
                .eq('id', adminRole.user_id)
                .single();

              // Check if user has MFA enabled
              const { data: { user } } = await supabase.auth.admin.getUserById(adminRole.user_id);
              const hasMfa = user?.factors && user.factors.length > 0;

              // Calculate grace period (7 days from account creation)
              const createdAt = new Date(profile?.created_at || new Date());
              const gracePeriodExpires = new Date(createdAt);
              gracePeriodExpires.setDate(gracePeriodExpires.getDate() + 7);

              const now = new Date();
              const isCompliant = hasMfa || now < gracePeriodExpires;

              return {
                user_id: adminRole.user_id,
                full_name: profile?.full_name || 'Utilisateur inconnu',
                role: adminRole.role,
                has_mfa: hasMfa || false,
                account_created_at: profile?.created_at || new Date().toISOString(),
                grace_period_expires_at: gracePeriodExpires.toISOString(),
                is_compliant: isCompliant
              };
            })
          );

          data = adminData;
        }
      }

      const processedAdmins = (data || []).map(calculateStatus);
      setAdmins(processedAdmins);
    } catch (err) {
      logger.logError(err, { context: 'useMfaCompliance', action: 'fetch' });
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompliance();

    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchCompliance, 60000);
    return () => clearInterval(interval);
  }, [fetchCompliance]);

  const refresh = useCallback(() => {
    fetchCompliance();
  }, [fetchCompliance]);

  const compliantCount = admins.filter(a => a.status === 'compliant').length;
  const warningCount = admins.filter(a => a.status === 'warning').length;
  const criticalCount = admins.filter(a => a.status === 'critical').length;

  return {
    admins,
    loading,
    error,
    refresh,
    stats: {
      total: admins.length,
      compliant: compliantCount,
      warning: warningCount,
      critical: criticalCount,
    },
  };
};

