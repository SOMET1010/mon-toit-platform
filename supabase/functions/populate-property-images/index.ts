import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Récupérer toutes les propriétés sans image
    const { data: properties, error: fetchError } = await supabaseClient
      .from('properties')
      .select('id, title, property_type, city, neighborhood')
      .is('main_image', null)
      .limit(10);

    if (fetchError) throw fetchError;

    console.log(`Found ${properties?.length || 0} properties without images`);

    const results = [];

    for (const property of properties || []) {
      try {
        // Générer une description détaillée pour l'image
        const imagePrompt = getImagePrompt(property);
        
        console.log(`Generating image for property ${property.id}: ${imagePrompt}`);

        // Générer l'image avec Lovable AI
        const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image-preview",
            messages: [
              {
                role: "user",
                content: imagePrompt
              }
            ],
            modalities: ["image", "text"]
          })
        });

        if (!imageResponse.ok) {
          throw new Error(`Image generation failed: ${await imageResponse.text()}`);
        }

        const imageData = await imageResponse.json();
        const base64Image = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (!base64Image) {
          throw new Error('No image generated');
        }

        // Convertir base64 en blob
        const base64Data = base64Image.split(',')[1];
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

        // Upload vers Supabase Storage
        const fileName = `property-${property.id}-${Date.now()}.png`;
        const { data: uploadData, error: uploadError } = await supabaseClient.storage
          .from('property-images')
          .upload(fileName, binaryData, {
            contentType: 'image/png',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Obtenir l'URL publique
        const { data: urlData } = supabaseClient.storage
          .from('property-images')
          .getPublicUrl(fileName);

        // Mettre à jour la propriété avec l'URL de l'image
        const { error: updateError } = await supabaseClient
          .from('properties')
          .update({ main_image: urlData.publicUrl })
          .eq('id', property.id);

        if (updateError) throw updateError;

        results.push({
          propertyId: property.id,
          title: property.title,
          imageUrl: urlData.publicUrl,
          success: true
        });

        console.log(`Successfully generated and uploaded image for property ${property.id}`);
      } catch (error) {
        console.error(`Error processing property ${property.id}:`, error);
        results.push({
          propertyId: property.id,
          title: property.title,
          success: false,
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        processedCount: results.length,
        results 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

function getImagePrompt(property: any): string {
  const typeDescriptions: Record<string, string> = {
    'appartement': 'modern apartment building exterior with balconies',
    'villa': 'luxury villa with garden and modern architecture',
    'studio': 'contemporary studio apartment building',
    'duplex': 'elegant duplex residence with two floors',
    'maison': 'beautiful family house with yard'
  };

  const baseDesc = typeDescriptions[property.property_type] || 'residential property';
  
  return `Generate a high-quality, professional real estate photograph of a ${baseDesc} in ${property.city}, ${property.neighborhood}. The image should be bright, welcoming, with blue sky, showing the exterior facade. Style: professional real estate photography, well-lit, attractive, 16:9 aspect ratio. Ultra high resolution.`;
}
