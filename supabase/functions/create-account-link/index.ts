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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get the session or user object
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error('Non authentifié');
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Récupérer le profil de l'utilisateur
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      throw new Error('Profil non trouvé');
    }

    let stripeAccountId = profile.stripe_account_id;

    // Si l'utilisateur n'a pas encore de compte Stripe, en créer un
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'FR',
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual', // Spécifier que c'est un compte individuel
        individual: {
          email: user.email,
        },
      });

      stripeAccountId = account.id;

      // Mettre à jour le profil avec l'ID du compte Stripe
      await supabaseClient
        .from('profiles')
        .update({ stripe_account_id: stripeAccountId })
        .eq('id', user.id);
    }

    // Créer le lien d'onboarding
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${req.headers.get('origin')}/profile`,
      return_url: `${req.headers.get('origin')}/profile`,
      type: 'account_onboarding',
    });

    return new Response(
      JSON.stringify({ url: accountLink.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Erreur lors de la création du lien d\'onboarding:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});