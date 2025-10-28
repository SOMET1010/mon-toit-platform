// Edge Function pour récupérer le token Mapbox depuis les Secrets Supabase
// URL: https://haffcubwactwjpngcpdf.supabase.co/functions/v1/get-mapbox-token

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Récupérer le token Mapbox depuis les Secrets Supabase
    const mapboxToken = Deno.env.get('MAPBOX_TOKEN')

    if (!mapboxToken) {
      return new Response(
        JSON.stringify({ 
          error: 'Token Mapbox non configuré dans les Secrets Supabase',
          hint: 'Ajoutez MAPBOX_TOKEN dans les Secrets du projet Supabase'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Retourner le token
    return new Response(
      JSON.stringify({ 
        token: mapboxToken,
        success: true
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})

