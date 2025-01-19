import { useEffect, useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { useCryptoRates } from "@/hooks/useCryptoRates";
import { useCurrencyStore } from "@/stores/currencyStore";
import { Loader2 } from "lucide-react";

interface DescriptionSectionProps {
  form: UseFormReturn<any>;
}

export function DescriptionSection({ form }: DescriptionSectionProps) {
  const { data: cryptoRates, isLoading: isLoadingRates } = useCryptoRates();
  const { selectedCurrency } = useCurrencyStore();
  const [price, setPrice] = useState<string>("");
  const [selectedCrypto, setSelectedCrypto] = useState<string>("");
  const [cryptoAmount, setCryptoAmount] = useState<number | null>(null);

  const handlePriceChange = (value: string) => {
    console.log("Prix saisi:", value);
    setPrice(value);
    form.setValue('price', value);
    
    if (selectedCrypto && cryptoRates) {
      updateCryptoAmount(parseFloat(value) || 0, selectedCrypto);
    }
  };

  const updateCryptoAmount = (priceValue: number, cryptoSymbol: string) => {
    console.log("Mise à jour du montant crypto:", { 
      priceValue, 
      cryptoSymbol, 
      devise: selectedCurrency 
    });
    
    if (cryptoRates) {
      const selectedRate = cryptoRates.find(rate => rate.symbol === cryptoSymbol);
      if (selectedRate) {
        console.log("Taux trouvé:", selectedRate);
        
        // Sélectionner le bon taux selon la devise
        let rate: number;
        switch (selectedCurrency) {
          case 'USD':
            rate = Number(selectedRate.rate_usd);
            break;
          case 'GBP':
            rate = Number(selectedRate.rate_gbp);
            break;
          default: // EUR
            rate = Number(selectedRate.rate_eur);
            break;
        }

        // Calculer le montant en crypto
        const calculatedAmount = priceValue / rate;
        
        console.log("Calcul du montant en crypto:", {
          prixEnDevise: priceValue,
          tauxDeChange: rate,
          montantCrypto: calculatedAmount,
          devise: selectedCurrency
        });
        
        setCryptoAmount(calculatedAmount);
        form.setValue('crypto_amount', calculatedAmount);
        form.setValue('crypto_currency', cryptoSymbol);
      }
    }
  };

  const handleCryptoChange = (value: string) => {
    console.log("Crypto sélectionnée:", value);
    setSelectedCrypto(value);
    if (price) {
      updateCryptoAmount(parseFloat(price) || 0, value);
    }
  };

  useEffect(() => {
    if (price && selectedCrypto) {
      console.log("Devise changée, mise à jour des montants");
      updateCryptoAmount(parseFloat(price) || 0, selectedCrypto);
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

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prix ({selectedCurrency})</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
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
                        <SelectValue placeholder={
                          isLoadingRates 
                            ? "Chargement..." 
                            : "Sélectionnez une crypto"
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingRates ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : (
                        cryptoRates?.map((crypto) => (
                          <SelectItem key={crypto.symbol} value={crypto.symbol}>
                            {crypto.name} ({crypto.symbol})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {cryptoAmount && selectedCrypto && (
                    <p className="text-sm text-muted-foreground mt-1">
                      ≈ {cryptoAmount.toFixed(8)} {selectedCrypto}
                    </p>
                  )}
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