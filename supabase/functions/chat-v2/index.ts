// Supabase Edge Function for AI Chat with RAG (Retrieval-Augmented Generation)
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

// Helper function to detect intent and extract keywords
function analyzeUserIntent(message: string): {
  intent: 'business' | 'event' | 'special' | 'general';
  keywords: string[];
  location?: string;
} {
  const lowerMessage = message.toLowerCase();
  
  // Event-related keywords
  if (lowerMessage.match(/event|activity|happening|festival|concert|show|exhibition/)) {
    return {
      intent: 'event',
      keywords: extractKeywords(message),
      location: extractLocation(message)
    };
  }
  
  // Special/deal-related keywords
  if (lowerMessage.match(/deal|discount|offer|special|promo|sale|cheap/)) {
    return {
      intent: 'special',
      keywords: extractKeywords(message),
      location: extractLocation(message)
    };
  }
  
  // Business-related keywords (restaurants, cafes, shops, etc.)
  if (lowerMessage.match(/restaurant|cafe|coffee|shop|store|bar|pub|place|find|where/)) {
    return {
      intent: 'business',
      keywords: extractKeywords(message),
      location: extractLocation(message)
    };
  }
  
  return {
    intent: 'general',
    keywords: extractKeywords(message),
    location: extractLocation(message)
  };
}

function extractKeywords(message: string): string[] {
  const stopWords = ['the', 'a', 'an', 'in', 'on', 'at', 'for', 'to', 'of', 'with', 'best', 'good', 'great', 'find', 'where', 'is', 'are'];
  const words = message.toLowerCase().split(/\s+/);
  return words.filter(word => word.length > 3 && !stopWords.includes(word));
}

function extractLocation(message: string): string | undefined {
  const locations = ['auckland', 'cbd', 'ponsonby', 'parnell', 'newmarket', 'mt eden', 'takapuna', 'albany'];
  const lowerMessage = message.toLowerCase();
  for (const loc of locations) {
    if (lowerMessage.includes(loc)) {
      return loc;
    }
  }
  return undefined;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [], userId, sessionId }: ChatRequest = await req.json();

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get environment variables
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    // Use gpt-4o-mini - stable, works well, reasonable cost
    const openaiModel = 'gpt-4o-mini';
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Create Supabase client with service role key for database access
    const supabase = createClient(
      supabaseUrl || '',
      supabaseServiceKey || '',
      { auth: { persistSession: false } }
    );

    // Analyze user intent
    const intent = analyzeUserIntent(message);
    console.log('User intent:', intent);

    // Retrieve relevant data from database based on intent
    let contextData = '';
    
    if (intent.intent === 'business') {
      // Query businesses table - only basic fields
      const { data: businesses, error } = await supabase
        .from('businesses')
        .select('id, name, description, rating, is_active')
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(5);
      
      console.log('Business query result:', { count: businesses?.length || 0, error: error?.message });
      
      if (businesses && businesses.length > 0) {
        contextData = `\n\n**Real businesses from our database:**\n${businesses.map((b, i) => {
          return `${i + 1}. **${b.name}**
   - Rating: ${b.rating || 'N/A'} ⭐
   - Description: ${b.description || 'Great local business'}`;
        }).join('\n\n')}`;
      }
    } else if (intent.intent === 'event') {
      // Query events table
      const { data: events, error } = await supabase
        .from('events')
        .select('title, description, date, location, price, tags')
        .eq('is_active', true)
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(5);
      
      if (events && events.length > 0) {
        contextData = `\n\n**Real events from our database:**\n${events.map((e, i) => 
          `${i + 1}. **${e.title}**
   - Date: ${new Date(e.date).toLocaleDateString()}
   - Location: ${e.location || 'TBA'}
   - Price: ${e.price || 'Free'}
   - Tags: ${e.tags?.join(', ') || 'N/A'}
   - Description: ${e.description?.substring(0, 100)}...`
        ).join('\n\n')}`;
      }
    } else if (intent.intent === 'special') {
      // Query specials table
      const { data: specials, error } = await supabase
        .from('specials')
        .select('title, description, discount_percentage, business_id, valid_until, terms')
        .eq('is_active', true)
        .gte('valid_until', new Date().toISOString())
        .order('discount_percentage', { ascending: false })
        .limit(5);
      
      if (specials && specials.length > 0) {
        contextData = `\n\n**Real special offers from our database:**\n${specials.map((s, i) => 
          `${i + 1}. **${s.title}**
   - Discount: ${s.discount_percentage}% OFF
   - Valid until: ${new Date(s.valid_until).toLocaleDateString()}
   - Description: ${s.description?.substring(0, 100)}...
   - Terms: ${s.terms || 'No special terms'}`
        ).join('\n\n')}`;
      }
    }

    // Build system prompt with real data context
    const systemPrompt = `You are LifeX, an AI assistant helping people discover local services, events, and businesses in New Zealand (especially Auckland).

Your role is to:
- Help users find local businesses, restaurants, cafes, services, events, and places
- Provide personalized recommendations based on their needs
- Be friendly, helpful, and use casual New Zealand English (e.g., "G'day", "mate")
- **IMPORTANT: When real data is provided below, prioritize it in your recommendations**
- Format business information naturally in your response
- Suggest relevant follow-up questions

${contextData ? `**You have access to real data from our database. Use this information to provide accurate recommendations:**${contextData}` : 'No specific data available for this query. Provide general helpful advice.'}

When recommending places:
- Mention specific names, addresses, and ratings from the data above
- Explain why you're recommending them based on their features
- Be conversational but informative
- Keep responses concise (under 200 words)`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10),
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
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API returned ${openaiResponse.status}: ${error}`);
    }

    const data = await openaiResponse.json();
    const aiMessage = data.choices?.[0]?.message?.content || "I'm having trouble responding right now. Please try again.";

    // Generate follow-up questions
    const followUpPrompt = `Based on the user's question "${message}" and your response, suggest 3 brief follow-up questions (each max 8 words). Return only the questions, one per line.`;

    const followUpResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: openaiModel,
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

    // Log chat interaction to database (optional)
    if (userId) {
      try {
        await supabase.from('chat_logs').insert({
          user_id: userId,
          session_id: sessionId,
          user_message: message,
          ai_response: aiMessage,
          intent: intent.intent,
          has_context_data: !!contextData,
          created_at: new Date().toISOString()
        });
      } catch (err) {
        console.error('Failed to log chat:', err);
      }
    }

    return new Response(
      JSON.stringify({
        message: aiMessage,
        followUpQuestions,
        usage: data.usage,
        debug: {
          intent: intent.intent,
          hasContextData: !!contextData,
          dataSourcesUsed: contextData ? [intent.intent] : []
        }
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



