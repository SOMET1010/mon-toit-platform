import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { getClientIP } from '@/lib/ipUtils';
import { useToast } from '@/hooks/use-toast';
import { formatRetryAfter } from '@/lib/ipUtils';
import { logger } from '@/services/logger';

interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  retryAfter?: string;
}

/**
 * Hook pour protéger les actions contre le rate limiting
 * @param endpoint - Nom de l'endpoint à protéger (ex: '/properties/create')
 * @param maxRequests - Nombre maximum de requêtes autorisées
 * @param windowMinutes - Fenêtre de temps en minutes
 */
export const useRateLimitProtection = (
  endpoint: string,
  maxRequests: number = 100,
  windowMinutes: number = 15
) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);

  const checkLimit = async (): Promise<RateLimitResult> => {
    setIsChecking(true);
    
    try {
      const ipAddress = await getClientIP();
      
      // Try RPC first, fallback to direct query
      let data = null;
      let error = null;
      
      try {
        const result = await supabase.rpc('check_api_rate_limit', {
          _endpoint: endpoint,
          _user_id: user?.id || null,
          _ip_address: ipAddress,
          _max_requests: maxRequests,
          _window_minutes: windowMinutes
        });
        
        data = result.data;
        error = result.error;
      } catch (rpcError) {
        console.warn('RPC check_api_rate_limit not found, using fallback');
        
        // Fallback: check api_rate_limits table directly
        const windowStart = new Date();
        windowStart.setMinutes(windowStart.getMinutes() - windowMinutes);
        
        const { data: recentRequests, error: queryError } = await supabase
          .from('api_rate_limits')
          .select('*')
          .eq('endpoint', endpoint)
          .gte('created_at', windowStart.toISOString())
          .or(`user_id.eq.${user?.id || 'null'},ip_address.eq.${ipAddress}`);
        
        if (queryError) {
          error = queryError;
        } else {
          const requestCount = recentRequests?.length || 0;
          
          if (requestCount >= maxRequests) {
            data = null; // Rate limit exceeded
          } else {
            data = true; // Within limits
            
            // Log this request
            await supabase.from('api_rate_limits').insert({
              endpoint,
              user_id: user?.id || null,
              ip_address: ipAddress
            });
          }
        }
      }

      if (error) {
        logger.logError(error, { context: 'useRateLimitProtection', action: 'check', endpoint });
        // En cas d'erreur, on autorise l'action pour ne pas bloquer les utilisateurs légitimes
        return { allowed: true };
      }

      if (!data) {
        toast({
          title: "Limite atteinte",
          description: `Vous avez atteint la limite de ${maxRequests} actions en ${windowMinutes} minutes. Veuillez réessayer plus tard.`,
          variant: "destructive"
        });
        
        return {
          allowed: false,
          reason: `Limite de ${maxRequests} actions/${windowMinutes}min atteinte`
        };
      }

      return { allowed: true };
    } catch (error) {
      logger.logError(error, { context: 'useRateLimitProtection', action: 'checkLimit', endpoint });
      // En cas d'erreur, on autorise l'action
      return { allowed: true };
    } finally {
      setIsChecking(false);
    }
  };

  return { checkLimit, isChecking };
};

