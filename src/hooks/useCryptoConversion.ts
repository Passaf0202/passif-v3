import { useCryptoRates } from "./useCryptoRates";
import { useCurrencyStore } from "@/stores/currencyStore";

export const useCryptoConversion = (price: number, cryptoCurrency?: string) => {
  const { data: cryptoRates } = useCryptoRates();
  const { selectedCurrency } = useCurrencyStore();

  const calculateCryptoAmount = () => {
    if (!cryptoRates || !Array.isArray(cryptoRates)) {
      console.log('Invalid cryptoRates:', cryptoRates);
      return null;
    }

    // Si une crypto est spécifiée dans l'annonce, l'utiliser, sinon ETH par défaut
    const targetCrypto = cryptoCurrency || 'ETH';
    const rate = cryptoRates.find(r => r.symbol === targetCrypto);
    
    if (!rate) {
      console.log(`${targetCrypto} rate not found in:`, cryptoRates);
      return null;
    }

    console.log(`Using ${targetCrypto} rate:`, rate);

    let priceInEur = price;
    // Convertir le prix en EUR si nécessaire
    switch (selectedCurrency) {
      case 'USD':
        priceInEur = price / rate.rate_usd * rate.rate_eur;
        break;
      case 'GBP':
        priceInEur = price / rate.rate_gbp * rate.rate_eur;
        break;
    }

    // Calculer le montant en crypto
    const cryptoAmount = priceInEur / rate.rate_eur;
    console.log(`Calculated ${targetCrypto} amount:`, cryptoAmount, 'for price:', priceInEur, 'EUR');
    
    return {
      amount: cryptoAmount,
      currency: targetCrypto
    };
  };

  return calculateCryptoAmount();
};