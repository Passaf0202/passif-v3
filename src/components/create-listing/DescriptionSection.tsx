
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { UseFormReturn } from "react-hook-form";
import { useCurrencyStore } from "@/stores/currencyStore";
import { useEffect, useState } from "react";

interface DescriptionSectionProps {
  form: UseFormReturn<any>;
}

const POL_RATES = {
  EUR: 0.92,
  USD: 1.00,
  GBP: 0.79
};

export function DescriptionSection({ form }: DescriptionSectionProps) {
  const { selectedCurrency } = useCurrencyStore();
  const [price, setPrice] = useState<string>("");
  const [cryptoAmount, setCryptoAmount] = useState<number | null>(null);

  const updateCryptoAmount = (priceValue: number) => {
    const rate = POL_RATES[selectedCurrency as keyof typeof POL_RATES];
    if (!rate) return;

    const amount = priceValue / rate;
    setCryptoAmount(amount);
    form.setValue('crypto_amount', amount);
    form.setValue('crypto_currency', 'POL');
  };

  const handlePriceChange = (value: string) => {
    setPrice(value);
    form.setValue('price', value);
    
    const numericPrice = parseFloat(value);
    if (!isNaN(numericPrice)) {
      updateCryptoAmount(numericPrice);
    }
  };

  useEffect(() => {
    if (price) {
      const numericPrice = parseFloat(price);
      if (!isNaN(numericPrice)) {
        updateCryptoAmount(numericPrice);
      }
    }
  }, [selectedCurrency]);

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

          <div className="space-y-4">
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

            {cryptoAmount && (
              <div className="text-sm text-muted-foreground">
                ≈ {cryptoAmount.toFixed(8)} POL
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
