import { useCryptoRates } from "./useCryptoRates";
import { useCurrencyStore } from "@/stores/currencyStore";

export function useCryptoConversion(price: number, cryptoCurrency?: string) {
  const { data: rates, isLoading, error } = useCryptoRates();
  const { selectedCurrency } = useCurrencyStore();

  if (isLoading || error || !rates || !cryptoCurrency) {
    return null;
  }

  const rate = rates.find(r => r.symbol === cryptoCurrency);
  if (!rate) {
    console.error(`No rate found for currency: ${cryptoCurrency}`);
    return null;
  }

  let rateToUse;
  switch (selectedCurrency) {
    case 'EUR':
      rateToUse = rate.rate_eur;
      break;
    case 'GBP':
      rateToUse = rate.rate_gbp;
      break;
    default:
      rateToUse = rate.rate_usd;
  }

  const cryptoAmount = price / rateToUse;
  console.log(`Converting ${price} ${selectedCurrency} to ${cryptoCurrency}:`, cryptoAmount);

  return {
    amount: cryptoAmount,
    currency: cryptoCurrency
  };
}