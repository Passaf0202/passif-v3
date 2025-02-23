
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PriceDetails } from "@/components/listing/PriceDetails";
import { useCryptoConversion } from "@/hooks/useCryptoConversion";

interface PriceFieldProps {
  form: UseFormReturn<any>;
}

export function PriceField({ form }: PriceFieldProps) {
  const price = form.watch("price");
  const cryptoAmount = useCryptoConversion(Number(price));

  return (
    <FormField
      control={form.control}
      name="price"
      render={({ field }) => (
        <FormItem className="space-y-4">
          <FormLabel>Prix</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder="Prix en euros"
              {...field}
              onChange={(e) => field.onChange(e.target.value)}
            />
          </FormControl>
          {price && (
            <div className="bg-white rounded-lg border p-4">
              <PriceDetails
                price={Number(price)}
                protectionFee={0}
                cryptoAmount={cryptoAmount?.amount}
                cryptoCurrency={cryptoAmount?.currency}
              />
            </div>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
