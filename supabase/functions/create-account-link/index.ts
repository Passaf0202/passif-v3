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

    // Get the authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error('User not authenticated');
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Get the user's profile
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      throw new Error('Profile not found');
    }

    console.log('Creating/retrieving Stripe account for user:', user.id);

    // Create or retrieve Stripe account
    let account;
    try {
      // Try to find existing account by user ID
      const accounts = await stripe.accounts.list({
        limit: 1,
      });

      const existingAccount = accounts.data.find(acc => 
        acc.metadata?.supabase_user_id === user.id
      );

      if (existingAccount) {
        console.log('Found existing Stripe account:', existingAccount.id);
        account = existingAccount;
      } else {
        // Create new account with proper metadata
        console.log('Creating new Stripe account for user:', user.id);
        account = await stripe.accounts.create({
          type: 'express',
          country: 'FR',
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
          business_type: 'individual',
          metadata: {
            supabase_user_id: user.id
          },
          tos_acceptance: {
            service_agreement: 'recipient',
          },
        });
        console.log('Created new Stripe account:', account.id);
      }

      // Create account link
      console.log('Creating account link for:', account.id);
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
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
      console.error('Error in Stripe operations:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});