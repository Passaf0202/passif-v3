import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrencyStore } from "@/stores/currencyStore";

export const useCryptoConversion = (price: number, cryptoCurrency?: string) => {
  const { selectedCurrency } = useCurrencyStore();

  const { data: cryptoRates } = useQuery({
    queryKey: ['crypto-rates'],
    queryFn: async () => {
      try {
        console.log(`Récupération du taux pour ${cryptoCurrency} en ${selectedCurrency}`);
        
        const { data: rates, error } = await supabase
          .from('crypto_rates')
          .select('*')
          .eq('symbol', cryptoCurrency || 'BNB')
          .eq('is_active', true)
          .maybeSingle();

        if (error) throw error;
        
        if (!rates) {
          console.error('Aucun taux trouvé pour', cryptoCurrency);
          return null;
        }

        console.log('Taux récupérés:', rates);
        return rates;
      } catch (error) {
        console.error('Erreur lors de la récupération des taux:', error);
        return null;
      }
    },
    enabled: !!cryptoCurrency,
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
  });

  const calculateCryptoAmount = () => {
    if (!price || !cryptoRates) {
      console.log('Pas de prix ou de taux disponible');
      return null;
    }

    // Sélectionner le bon taux selon la devise
    let rate: number;
    switch (selectedCurrency) {
      case 'USD':
        rate = Number(cryptoRates.rate_usd);
        break;
      case 'GBP':
        rate = Number(cryptoRates.rate_gbp);
        break;
      default: // EUR
        rate = Number(cryptoRates.rate_eur);
        break;
    }

    // Calculer le montant en crypto
    const cryptoAmount = price / rate;

    console.log('Calcul de la conversion:', {
      prix: price,
      devise: selectedCurrency,
      taux: rate,
      montantCrypto: cryptoAmount,
      crypto: cryptoCurrency
    });

    return {
      amount: cryptoAmount,
      currency: cryptoCurrency || 'BNB'
    };
  };

  return calculateCryptoAmount();
};