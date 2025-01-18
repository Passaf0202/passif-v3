import { create } from 'zustand';

type CurrencyStore = {
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
};

export const useCurrencyStore = create<CurrencyStore>((set) => ({
  selectedCurrency: 'EUR',
  setSelectedCurrency: (currency) => set({ selectedCurrency: currency }),
}));