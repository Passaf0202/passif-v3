export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  if (fromCurrency === 'ETH' && toCurrency === 'EUR') {
    return amount * 2000; // Taux de conversion approximatif ETH -> EUR
  } else if (fromCurrency === 'ETH' && toCurrency === 'USD') {
    return amount * 2200; // Taux de conversion approximatif ETH -> USD
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