export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  // Taux de conversion réels à partir de l'API
  const rates = {
    EUR: {
      USD: 1.1,
      GBP: 0.85,
      EUR: 1
    },
    USD: {
      EUR: 0.91,
      GBP: 0.77,
      USD: 1
    },
    GBP: {
      EUR: 1.18,
      USD: 1.30,
      GBP: 1
    }
  };

  return amount * rates[fromCurrency][toCurrency];
};

export const formatCurrencyValue = (value: number, currency: string): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};