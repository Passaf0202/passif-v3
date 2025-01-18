export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  // Pour l'instant on garde le montant tel quel car c'est déjà en ETH
  return amount;
};

export const formatCurrencyValue = (value: number, currency: string): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 8
  }).format(value);
};