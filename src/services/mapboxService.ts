import { supabase } from '@/integrations/supabase/client';
import { logger } from './logger';

/**
 * Service pour récupérer le token Mapbox depuis l'Edge Function Supabase
 */

let cachedToken: string | null = null;
let tokenFetchPromise: Promise<string | null> | null = null;

/**
 * Récupère le token Mapbox depuis l'Edge Function Supabase
 * Utilise un cache pour éviter les appels répétés
 */
export const getMapboxToken = async (): Promise<string | null> => {
  // Si le token est déjà en cache, le retourner
  if (cachedToken) {
    return cachedToken;
  }

  // Si une requête est déjà en cours, attendre son résultat
  if (tokenFetchPromise) {
    return tokenFetchPromise;
  }

  // Créer une nouvelle requête
  tokenFetchPromise = (async () => {
    try {
      logger.info('Récupération du token Mapbox depuis Supabase Edge Function...');

      const { data, error } = await supabase.functions.invoke('get-mapbox-token', {
        method: 'GET',
      });

      if (error) {
        logger.error('Erreur lors de la récupération du token Mapbox:', error);
        return null;
      }

      if (!data || !data.token) {
        logger.error('Token Mapbox non trouvé dans la réponse');
        return null;
      }

      // Mettre en cache le token
      cachedToken = data.token;
      logger.info('Token Mapbox récupéré avec succès');

      return cachedToken;
    } catch (err) {
      logger.error('Exception lors de la récupération du token Mapbox:', err);
      return null;
    } finally {
      // Réinitialiser la promesse après la résolution
      tokenFetchPromise = null;
    }
  })();

  return tokenFetchPromise;
};

/**
 * Réinitialise le cache du token (utile pour forcer un refresh)
 */
export const clearMapboxTokenCache = () => {
  cachedToken = null;
  tokenFetchPromise = null;
  logger.info('Cache du token Mapbox réinitialisé');
};

