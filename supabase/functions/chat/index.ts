// Supabase Edge Function for AI Chat
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  message: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  userId?: string;
  sessionId?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [], userId, sessionId }: ChatRequest = await req.json();

    // Validate input
    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get environment variables
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const openaiModel = Deno.env.get('OPENAI_MODEL') || 'gpt-4o-mini';
    
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Build messages for OpenAI
    const systemPrompt = `You are LifeX, an AI assistant helping people discover local services, events, and businesses in New Zealand (especially Auckland).

Your role is to:
- Help users find local businesses, restaurants, cafes, services, events, and places
- Provide personalized recommendations based on their needs
- Be friendly, helpful, and use casual New Zealand English (e.g., "G'day", "mate")
- Ask clarifying questions when needed
- Suggest relevant follow-up questions

When recommending places, consider:
- User preferences and requirements
- Location and distance
- Ratings and reviews
- Price range
- Current availability
- Special features or highlights

Format your responses in a conversational, helpful manner. Keep responses concise but informative.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message }
    ];

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: openaiModel,
        messages,
        temperature: 0.7,
        max_tokens: 500,
        presence_penalty: 0.6,
        frequency_penalty: 0.3,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API returned ${openaiResponse.status}: ${error}`);
    }

    const data = await openaiResponse.json();
    const aiMessage = data.choices[0]?.message?.content || "I'm having trouble responding right now. Please try again.";

    // Generate follow-up questions using AI
    const followUpPrompt = `Based on the user's question "${message}" and your response "${aiMessage}", suggest 3 brief follow-up questions (each max 8 words) that the user might want to ask next. Return only the questions, one per line, without numbers or bullets.`;

    const followUpResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Use faster model for follow-ups
        messages: [
          { role: 'system', content: 'You are a helpful assistant that suggests brief follow-up questions.' },
          { role: 'user', content: followUpPrompt }
        ],
        temperature: 0.8,
        max_tokens: 100,
      }),
    });

    let followUpQuestions: string[] = [];
    if (followUpResponse.ok) {
      const followUpData = await followUpResponse.json();
      const followUpText = followUpData.choices[0]?.message?.content || '';
      followUpQuestions = followUpText
        .split('\n')
        .filter((q: string) => q.trim().length > 0)
        .slice(0, 3);
    }

    // Log chat for analytics (optional - connect to Supabase)
    // You can save chat history to database here if needed

    return new Response(
      JSON.stringify({
        message: aiMessage,
        followUpQuestions,
        usage: data.usage, // For tracking token usage
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Chat function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        message: "I'm having trouble connecting right now. Please try again later.",
        followUpQuestions: [
          "Best coffee shops nearby?",
          "Family-friendly restaurants?",
          "Weekend activities in Auckland?"
        ]
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});






