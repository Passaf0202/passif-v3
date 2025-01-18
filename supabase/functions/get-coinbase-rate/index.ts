import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cryptoCurrency = 'BNB', fiatCurrency = 'EUR' } = await req.json();
    console.log(`Fetching rate for ${cryptoCurrency} in ${fiatCurrency}`);

    // Utiliser l'API CoinGecko pour obtenir les taux en temps réel
    const cryptoIds = {
      'BNB': 'binancecoin',
      'ETH': 'ethereum',
      'BTC': 'bitcoin',
      'SOL': 'solana'
    };

    const cryptoId = cryptoIds[cryptoCurrency] || 'binancecoin';
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=${fiatCurrency.toLowerCase()}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch rate from CoinGecko');
    }

    const data = await response.json();
    const rate = data[cryptoId][fiatCurrency.toLowerCase()];

    console.log('Rate response:', { rate });

    return new Response(
      JSON.stringify({ rate }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    
    // Taux de repli en cas d'erreur
    const fallbackRates = {
      'BNB': { 'EUR': 250 },
      'ETH': { 'EUR': 2500 },
      'BTC': { 'EUR': 38000 },
      'SOL': { 'EUR': 90 }
    };

    const { cryptoCurrency = 'BNB', fiatCurrency = 'EUR' } = await req.json();
    const fallbackRate = fallbackRates[cryptoCurrency]?.[fiatCurrency] || 250;

    return new Response(
      JSON.stringify({ 
        rate: fallbackRate,
        source: 'fallback'
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  }
});