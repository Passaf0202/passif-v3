import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "./ImageUpload";
import { LocationField } from "./LocationField";
import { CategorySelector } from "@/components/CategorySelector";
import { ProductDetails } from "@/components/ProductDetails";
import { ShippingDetails } from "@/components/ShippingDetails";

const formSchema = z.object({
  title: z.string().min(3, "Le titre doit faire au moins 3 caractères"),
  description: z.string().min(10, "La description doit faire au moins 10 caractères"),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Le prix doit être un nombre positif",
  }),
  location: z.string().min(2, "La localisation est requise"),
});

interface ListingFormProps {
  onSubmit: (values: z.infer<typeof formSchema>, images: File[]) => Promise<void>;
  isSubmitting: boolean;
}

export function ListingForm({ onSubmit, isSubmitting }: ListingFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      location: "",
    },
  });

  const [category, setCategory] = useState<string>("");
  const [subcategory, setSubcategory] = useState<string>("");
  const [subsubcategory, setSubsubcategory] = useState<string>("");
  const [productDetails, setProductDetails] = useState<{
    brand?: string;
    condition?: string;
    color?: string[];
    material?: string[];
  }>({});
  const [shippingDetails, setShippingDetails] = useState<{
    method?: string;
    weight?: number;
  }>({});
  const [images, setImages] = useState<File[]>([]);

  const handleCategoryChange = (
    mainCategory: string,
    sub?: string,
    subsub?: string
  ) => {
    setCategory(mainCategory);
    setSubcategory(sub || "");
    setSubsubcategory(subsub || "");
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    await onSubmit({
      ...values,
      category,
      subcategory,
      subsubcategory,
      ...productDetails,
      ...shippingDetails,
    }, images);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre</FormLabel>
              <FormControl>
                <Input placeholder="Titre de l'annonce" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <CategorySelector onCategoryChange={handleCategoryChange} />

        <ProductDetails
          category={category}
          subcategory={subcategory}
          subsubcategory={subsubcategory}
          onDetailsChange={setProductDetails}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Décrivez votre article..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prix</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Prix en euros"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <ShippingDetails onShippingChange={setShippingDetails} />

        <LocationField
          form={form}
          shippingMethod={shippingDetails.method}
        />

        <ImageUpload
          images={images}
          onImagesChange={setImages}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Création en cours..." : "Créer l'annonce"}
        </Button>
      </form>
    </Form>
  );
}