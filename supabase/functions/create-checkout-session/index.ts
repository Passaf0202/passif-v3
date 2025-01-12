import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { listingId, sellerId } = await req.json();

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get the session or user object
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    // Get the listing details
    const { data: listing } = await supabaseClient
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .single();

    if (!listing) {
      throw new Error('Annonce non trouvée');
    }

    // Get the seller's profile to get their Stripe account ID
    const { data: sellerProfile } = await supabaseClient
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', sellerId)
      .single();

    if (!sellerProfile?.stripe_account_id) {
      throw new Error('Le vendeur doit d\'abord configurer son compte Stripe');
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Verify that the seller's account is properly set up
    const account = await stripe.accounts.retrieve(sellerProfile.stripe_account_id);
    
    if (!account.charges_enabled) {
      throw new Error('Le compte Stripe du vendeur n\'est pas encore vérifié');
    }

    // Calculate the platform fee (15%)
    const platformFee = Math.round(listing.price * 0.15 * 100);
    const totalAmount = Math.round(listing.price * 100);

    // Create the payment session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: listing.title,
              images: listing.images,
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: sellerProfile.stripe_account_id,
        },
      },
      metadata: {
        listingId,
        sellerId,
        buyerId: user.id,
      },
      success_url: `${req.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/listings/${listingId}`,
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Erreur lors de la création de la session de paiement:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});