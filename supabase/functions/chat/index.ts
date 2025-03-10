import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message, context } = await req.json()
    console.log('Received request:', { message, context })

    if (!message) {
      throw new Error('Message is required')
    }

    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Tu es un assistant de recherche pour un site de petites annonces. Tu dois aider les utilisateurs à trouver ce qu'ils cherchent en leur posant des questions pertinentes et en leur faisant des suggestions adaptées.${
              context?.category ? `\nLa catégorie actuelle est: ${context.category}` : ''
            }${
              context?.query ? `\nLa recherche actuelle est: ${context.query}` : ''
            }`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!openAiResponse.ok) {
      const errorData = await openAiResponse.text()
      console.error('OpenAI API error:', errorData)
      throw new Error(`OpenAI API error: ${openAiResponse.status} ${errorData}`)
    }

    const data = await openAiResponse.json()
    console.log('OpenAI API response:', data)

    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid OpenAI response structure:', data)
      throw new Error('Invalid response structure from OpenAI API')
    }

    const aiResponse = data.choices[0].message.content

    return new Response(
      JSON.stringify({ message: aiResponse }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error in chat function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})