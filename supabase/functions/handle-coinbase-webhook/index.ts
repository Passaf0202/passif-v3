import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { createHmac } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const signature = req.headers.get('x-cc-webhook-signature')
  if (!signature) {
    return new Response(
      JSON.stringify({ error: 'Signature manquante' }),
      { headers: corsHeaders, status: 401 }
    )
  }

  try {
    const rawBody = await req.text()
    const webhookSecret = Deno.env.get('COINBASE_WEBHOOK_SECRET')
    
    if (!webhookSecret) {
      throw new Error('COINBASE_WEBHOOK_SECRET non configuré')
    }

    // Vérifier la signature du webhook
    const hmac = createHmac('sha256', webhookSecret)
    hmac.update(rawBody)
    const computedSignature = hmac.digest('hex')

    if (computedSignature !== signature) {
      return new Response(
        JSON.stringify({ error: 'Signature invalide' }),
        { headers: corsHeaders, status: 401 }
      )
    }

    const event = JSON.parse(rawBody)
    console.log('Webhook reçu:', event)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Mettre à jour le statut de la transaction en fonction de l'événement
    switch (event.type) {
      case 'charge:confirmed':
        await supabase
          .from('transactions')
          .update({
            status: 'confirmed',
            escrow_status: 'funded',
            updated_at: new Date().toISOString()
          })
          .eq('transaction_hash', event.data.code)
        break

      case 'charge:failed':
        await supabase
          .from('transactions')
          .update({
            status: 'failed',
            escrow_status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('transaction_hash', event.data.code)
        break

      case 'charge:delayed':
        await supabase
          .from('transactions')
          .update({
            status: 'delayed',
            updated_at: new Date().toISOString()
          })
          .eq('transaction_hash', event.data.code)
        break
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error('Erreur webhook:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      { headers: corsHeaders, status: 500 }
    )
  }
})