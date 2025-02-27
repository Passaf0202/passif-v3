
export const calculateBuyerProtectionFees = (price: number) => {
  if (price < 500) {
    return 0.70 + (price * 0.05);
  }
  return price * 0.02;
};

export const formatPrice = (price: number) => {
  return price.toFixed(2).replace('.', ',');
};
