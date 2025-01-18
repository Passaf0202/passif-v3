import { useEffect, useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useCurrencyStore } from "@/stores/currencyStore";

interface CryptoRate {
  symbol: string;
  name: string;
  rate_usd: number;
  rate_eur: number;
  rate_gbp: number;
}

interface DescriptionSectionProps {
  form: UseFormReturn<any>;
}

export function DescriptionSection({ form }: DescriptionSectionProps) {
  const [cryptoRates, setCryptoRates] = useState<CryptoRate[]>([]);
  const { selectedCurrency } = useCurrencyStore();
  const [price, setPrice] = useState<string>("");
  const [selectedCrypto, setSelectedCrypto] = useState<string>("");

  useEffect(() => {
    fetchCryptoRates();
  }, []);

  const fetchCryptoRates = async () => {
    const { data, error } = await supabase
      .from('crypto_rates')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching crypto rates:', error);
      return;
    }

    if (data) {
      console.log('Fetched crypto rates:', data);
      setCryptoRates(data);
    }
  };

  const handlePriceChange = (value: string) => {
    setPrice(value);
    const numericPrice = parseFloat(value) || 0;
    
    if (selectedCrypto && cryptoRates.length > 0) {
      const selectedRate = cryptoRates.find(rate => rate.symbol === selectedCrypto);
      if (selectedRate) {
        let cryptoAmount;
        switch (selectedCurrency) {
          case 'USD':
            cryptoAmount = numericPrice / selectedRate.rate_usd;
            break;
          case 'GBP':
            cryptoAmount = numericPrice / selectedRate.rate_gbp;
            break;
          default: // EUR
            cryptoAmount = numericPrice / selectedRate.rate_eur;
            break;
        }
        
        form.setValue('crypto_amount', cryptoAmount);
        form.setValue('crypto_currency', selectedCrypto);
      }
    }
    
    form.setValue('price', numericPrice);
  };

  const handleCryptoChange = (value: string) => {
    setSelectedCrypto(value);
    if (price) {
      handlePriceChange(price);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Décrivez votre article en détail..."
                    className="min-h-[150px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prix ({selectedCurrency})</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={`Prix en ${selectedCurrency}`}
                      onChange={(e) => handlePriceChange(e.target.value)}
                      value={price}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="crypto_currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cryptomonnaie</FormLabel>
                  <Select onValueChange={handleCryptoChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une crypto" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cryptoRates.map((crypto) => (
                        <SelectItem key={crypto.symbol} value={crypto.symbol}>
                          {crypto.name} ({crypto.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}