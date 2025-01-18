export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  // TODO: Implémenter une vraie API de taux de change
  if (fromCurrency === 'ETH' && toCurrency === 'EUR') {
    return amount * 2000; // Taux de conversion approximatif
  } else if (fromCurrency === 'ETH' && toCurrency === 'USD') {
    return amount * 2200; // Taux de conversion approximatif
  }
  return amount;
};

export const formatCurrencyValue = (value: number, currency: string): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};