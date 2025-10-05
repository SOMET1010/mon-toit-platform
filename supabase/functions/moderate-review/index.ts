import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ModerationResult {
  reviewId: string;
  moderationResult: {
    sentiment: 'positive' | 'negative' | 'neutral';
    inappropriateLanguage: boolean;
    personalInfoDetected: boolean;
    suspiciousContent: boolean;
    confidenceScore: number;
    suggestedAction: 'approve' | 'reject' | 'flag_for_review';
    aiReason: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin
    const { data: isAdmin } = await supabase.rpc('has_role', { 
      _user_id: user.id, 
      _role: 'admin' 
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { reviewId, reviewText } = await req.json();

    let textToAnalyze = reviewText;

    // If reviewId provided, fetch the review
    if (reviewId && !reviewText) {
      const { data: review, error: reviewError } = await supabase
        .from('reviews')
        .select('comment')
        .eq('id', reviewId)
        .single();

      if (reviewError) throw reviewError;
      textToAnalyze = review.comment;
    }

    if (!textToAnalyze) {
      return new Response(JSON.stringify({ error: 'No text to analyze' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call Lovable AI for moderation analysis
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a content moderation AI for a rental platform. Analyze reviews for:
1. Sentiment (positive/negative/neutral)
2. Inappropriate language (insults, threats, profanity)
3. Personal information (emails, phone numbers, addresses)
4. Suspicious content (spam, generic reviews, too short)
5. Overall confidence score (0-100)
6. Suggested action (approve/reject/flag_for_review)

Respond ONLY with valid JSON in this exact format:
{
  "sentiment": "positive" | "negative" | "neutral",
  "inappropriateLanguage": boolean,
  "personalInfoDetected": boolean,
  "suspiciousContent": boolean,
  "confidenceScore": number,
  "suggestedAction": "approve" | "reject" | "flag_for_review",
  "aiReason": "brief explanation"
}`
          },
          {
            role: 'user',
            content: `Analyze this review: "${textToAnalyze}"`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "moderate_review",
              description: "Analyze review content for moderation",
              parameters: {
                type: "object",
                properties: {
                  sentiment: { type: "string", enum: ["positive", "negative", "neutral"] },
                  inappropriateLanguage: { type: "boolean" },
                  personalInfoDetected: { type: "boolean" },
                  suspiciousContent: { type: "boolean" },
                  confidenceScore: { type: "number" },
                  suggestedAction: { type: "string", enum: ["approve", "reject", "flag_for_review"] },
                  aiReason: { type: "string" }
                },
                required: ["sentiment", "inappropriateLanguage", "personalInfoDetected", "suspiciousContent", "confidenceScore", "suggestedAction", "aiReason"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "moderate_review" } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', errorText);
      throw new Error('AI moderation failed');
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const moderationResult = JSON.parse(toolCall.function.arguments);

    // Auto-update review if confidence is high
    if (reviewId && moderationResult.confidenceScore > 90) {
      const newStatus = moderationResult.suggestedAction === 'approve' ? 'approved' : 
                       moderationResult.suggestedAction === 'reject' ? 'rejected' : 'pending';
      
      await supabase
        .from('reviews')
        .update({
          moderation_status: newStatus,
          moderation_notes: moderationResult.aiReason,
          moderated_by: user.id,
          moderated_at: new Date().toISOString(),
        })
        .eq('id', reviewId);
    }

    const result: ModerationResult = {
      reviewId: reviewId || 'N/A',
      moderationResult,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
