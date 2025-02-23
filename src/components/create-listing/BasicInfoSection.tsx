
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CategorySelector } from "@/components/CategorySelector";
import { UseFormReturn } from "react-hook-form";
import { PriceField } from "./PriceField";

interface BasicInfoSectionProps {
  form: UseFormReturn<any>;
  onCategoryChange: (mainCategory: string, sub?: string, subsub?: string) => void;
}

export function BasicInfoSection({ form, onCategoryChange }: BasicInfoSectionProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titre de l'annonce</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: BMW Série 3 320d" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <PriceField form={form} />

          <CategorySelector onCategoryChange={onCategoryChange} />
        </div>
      </CardContent>
    </Card>
  );
}
