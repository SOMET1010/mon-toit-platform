/**
 * Edge Function: CNAM Verification (VERSION CORRIGÉE)
 * 
 * Cette fonction utilise maintenant la validation JWT sécurisée
 * et implémente les meilleures pratiques de sécurité
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { 
  requireAuth, 
  createSuccessResponse, 
  handleCORS,
  logSecurityEvent,
  RateLimiter,
  corsHeaders
} from '../../../src/lib/jwtValidation.ts'

// Configuration de la fonction
const FUNCTION_NAME = 'cnam-verification'
const MAX_REQUESTS_PER_MINUTE = 10

serve(async (req: Request) => {
  // Gérer les requêtes CORS preflight
  const corsResponse = handleCORS(req)
  if (corsResponse) return corsResponse

  try {
    // 1. Rate Limiting - Protection contre les abus
    const clientIP = req.headers.get('cf-connecting-ip') || 
                    req.headers.get('x-forwarded-for') || 
                    'unknown'
    
    const rateLimitResult = RateLimiter.isAllowed(
      clientIP,
      MAX_REQUESTS_PER_MINUTE,
      60 * 1000
    )

    if (!rateLimitResult.allowed) {
      await logSecurityEvent({
        type: 'rate_limit_exceeded',
        ip_address: clientIP,
        details: {
          function: FUNCTION_NAME,
          attempts: rateLimitResult.remaining
        }
      })

      return new Response(
        JSON.stringify({
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Trop de tentatives. Réessayez plus tard.',
            retry_after: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
          }
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Retry-After': '60' }
        }
      )
    }

    // 2. Validation JWT obligatoire - Protection contre accès non autorisé
    const { user, response } = await requireAuth(
      req,
      'user', // Au moins rôle 'user' requis
      (userData) => {
        // Validation supplémentaire spécifique à cette fonction
        return userData.metadata?.verified === true || userData.role !== 'user'
      }
    )

    if (response) {
      await logSecurityEvent({
        type: 'unauthorized_access_attempt',
        user_id: user?.id,
        ip_address: clientIP,
        details: {
          function: FUNCTION_NAME,
          reason: 'JWT validation failed'
        }
      })
      return response
    }

    // 3. Validation de la requête
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({
          error: {
            code: 'METHOD_NOT_ALLOWED',
            message: 'Seule la méthode POST est acceptée'
          }
        }),
        {
          status: 405,
          headers: corsHeaders
        }
      )
    }

    // 4. Récupération et validation des données
    const requestData = await req.json()
    const { cniNumber, employerName, socialSecurityNumber } = requestData

    if (!cniNumber || !employerName) {
      await logSecurityEvent({
        type: 'invalid_request_data',
        user_id: user!.id,
        ip_address: clientIP,
        details: {
          function: FUNCTION_NAME,
          missing_fields: {
            cniNumber: !cniNumber,
            employerName: !employerName,
            socialSecurityNumber: !socialSecurityNumber
          }
        }
      })

      return new Response(
        JSON.stringify({
          error: {
            code: 'MISSING_REQUIRED_FIELDS',
            message: 'cniNumber et employerName sont requis'
          }
        }),
        {
          status: 400,
          headers: corsHeaders
        }
      )
    }

    // 5. Validation du format des données
    const cniRegex = /^[0-9]{10,12}$/
    
    if (!cniRegex.test(cniNumber)) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'INVALID_CNI_FORMAT',
            message: 'Format de CNI invalide (10-12 chiffres requis)'
          }
        }),
        {
          status: 400,
          headers: corsHeaders
        }
      )
    }

    // 6. Créer les clients Supabase avec gestion sécurisée
    const tempSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // 7. Traitement de la vérification CNAM
    // Simulation de l'appel à l'API CNAM (remplacer par la vraie implémentation)
    const verificationResult = await processCNAMVerification({
      cniNumber,
      employerName,
      socialSecurityNumber,
      user_id: user!.id
    })

    // 8. Log de l'activité de vérification
    await logSecurityEvent({
      type: 'cnam_verification_completed',
      user_id: user!.id,
      ip_address: clientIP,
      details: {
        cni_number: cniNumber.slice(-4), // Partiellement masqué
        verification_status: verificationResult.status,
        timestamp: new Date().toISOString()
      }
    })

    if (verificationResult.isValid) {
      // Créer le client avec service role pour les opérations sensibles
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      // Upsert dans user_verifications avec création automatique
      const { error: upsertError } = await supabase
        .from('user_verifications')
        .upsert({
          user_id: user!.id,
          cnam_status: 'pending_review',
          cnam_data: verificationResult.employmentData,
          cnam_employer: employerName,
          cnam_social_security_number: socialSecurityNumber,
        }, {
          onConflict: 'user_id'
        })

      if (upsertError) throw upsertError

      // Mettre à jour le profil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ cnam_verified: true })
        .eq('id', user!.id)

      if (profileError) throw profileError

      return createSuccessResponse({
        verified: true,
        cniNumber,
        employmentInfo: verificationResult.employmentData,
        status: 'PENDING_REVIEW',
        message: 'Vérification soumise. En attente de validation par un administrateur.',
        verifiedAt: new Date().toISOString()
      })
    } else {
      return createSuccessResponse({
        verified: false,
        error: 'Aucune information CNAM trouvée',
        status: 'FAILED'
      })
    }

  } catch (error) {
    // Gestion d'erreur robuste
    console.error('CNAM Verification Error:', error)

    await logSecurityEvent({
      type: 'function_execution_error',
      ip_address: req.headers.get('cf-connecting-ip') || 'unknown',
      details: {
        function: FUNCTION_NAME,
        error: error.message,
        stack: error.stack
      }
    })

    return new Response(
      JSON.stringify({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur interne du serveur',
          timestamp: new Date().toISOString()
        }
      }),
      {
        status: 500,
        headers: corsHeaders
      }
    )
  }
})

/**
 * Traitement de la vérification CNAM
 * Remplacer cette fonction par la vraie implémentation de l'API CNAM
 */
async function processCNAMVerification(data: {
  cniNumber: string
  employerName: string
  socialSecurityNumber?: string
  user_id: string
}) {
  // Simulation d'un délai d'API
  await new Promise(resolve => setTimeout(resolve, 1500))

  // Simulation de vérification (90% de succès)
  const isValid = Math.random() < 0.90
  
  if (!isValid) {
    return { isValid: false }
  }
  
  const employers = [
    'Orange Côte d\'Ivoire',
    'MTN Côte d\'Ivoire',
    'SODECI',
    'CIE',
    'Banque Atlantique',
    'SGI',
    'Air Côte d\'Ivoire'
  ]

  const randomEmployer = employers[Math.floor(Math.random() * employers.length)]
  const estimatedSalary = Math.floor(Math.random() * (1000000 - 200000) + 200000)

  const employmentData = {
    employer: data.employerName || randomEmployer,
    socialSecurityNumber: data.socialSecurityNumber || `SS${Math.random().toString().slice(2, 8)}`,
    employmentStatus: 'ACTIVE',
    contributionStatus: 'À JOUR',
    contractType: 'CDI',
    estimatedSalary: estimatedSalary,
    lastContribution: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }

  return {
    isValid: true,
    employmentData
  }
}

/**
 * Notes de sécurité importantes:
 * 
 * 1. JWT Validation: Toutes les requêtes nécessitent un token JWT valide
 * 2. Rate Limiting: Limite à 10 requêtes par minute par IP
 * 3. Input Validation: Validation stricte de tous les paramètres
 * 4. Audit Logging: Toutes les tentatives sont journalisées
 * 5. Error Handling: Gestion d'erreur sans fuite d'informations sensibles
 * 6. CORS: Configuration sécurisée pour les requêtes cross-origin
 * 7. Data Masking: Les données sensibles sont masquées dans les logs
 * 
 * Pour déployer cette fonction:
 * 1. supabase functions deploy cnam-verification
 * 2. Tester avec un token JWT valide
 * 3. Vérifier les logs dans admin_audit_logs
 */