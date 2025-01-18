import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { transactionId, action, userId } = await req.json()
    console.log('Release escrow request:', { transactionId, action, userId })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Récupérer la transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single()

    if (transactionError || !transaction) {
      throw new Error('Transaction non trouvée')
    }

    // Vérifier que l'utilisateur est soit l'acheteur soit le vendeur
    if (userId !== transaction.buyer_id && userId !== transaction.seller_id) {
      throw new Error('Non autorisé')
    }

    // Mettre à jour la confirmation en fonction de qui confirme
    const updates: any = {}
    if (userId === transaction.buyer_id) {
      updates.buyer_confirmation = true
    } else {
      updates.seller_confirmation = true
    }

    // Mettre à jour la transaction
    const { error: updateError } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', transactionId)

    if (updateError) {
      throw new Error('Erreur lors de la mise à jour de la transaction')
    }

    // Si les deux parties ont confirmé, libérer les fonds
    if (
      (userId === transaction.buyer_id && transaction.seller_confirmation) ||
      (userId === transaction.seller_id && transaction.buyer_confirmation)
    ) {
      // Appeler l'API Coinbase pour libérer les fonds
      const response = await fetch(`https://api.commerce.coinbase.com/charges/${transaction.transaction_hash}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CC-Api-Key': Deno.env.get('COINBASE_COMMERCE_API_KEY') ?? '',
          'X-CC-Version': '2018-03-22'
        }
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la libération des fonds')
      }

      // Mettre à jour le statut final de la transaction
      await supabase
        .from('transactions')
        .update({
          status: 'completed',
          escrow_status: 'completed',
          escrow_release_time: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Erreur:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Une erreur inattendue est survenue' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})