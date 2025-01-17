import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ProductDetails } from "@/components/ProductDetails";
import { BasicInfoSection } from "./BasicInfoSection";
import { DescriptionSection } from "./DescriptionSection";
import { ShippingLocationSection } from "./ShippingLocationSection";
import { PhotosSection } from "./PhotosSection";
import { WalletSection } from "./WalletSection";
import { AlertCircle } from "lucide-react";
import { useAccount } from 'wagmi';
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  title: z.string().min(3, "Le titre doit faire au moins 3 caractères"),
  description: z.string().min(10, "La description doit faire au moins 10 caractères"),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Le prix doit être un nombre positif",
  }),
  location: z.string().min(2, "La localisation est requise"),
});

interface ListingFormProps {
  onSubmit: (values: any) => Promise<void>;
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

  const { isConnected } = useAccount();
  const { toast } = useToast();
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
    if (!isConnected) {
      toast({
        title: "Wallet requis",
        description: "Veuillez connecter votre wallet avant de créer une annonce",
        variant: "destructive",
      });
      return;
    }
    await onSubmit({
      ...values,
      category,
      subcategory,
      subsubcategory,
      ...productDetails,
      ...shippingDetails,
      images
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2 space-y-8">
            <BasicInfoSection 
              form={form} 
              onCategoryChange={handleCategoryChange} 
            />

            <ProductDetails
              category={category}
              subcategory={subcategory}
              subsubcategory={subsubcategory}
              onDetailsChange={setProductDetails}
            />

            <DescriptionSection form={form} />

            <ShippingLocationSection
              form={form}
              shippingMethod={shippingDetails.method}
              onShippingChange={setShippingDetails}
              category={category}
            />

            <PhotosSection
              images={images}
              onImagesChange={setImages}
              category={category}
            />

            <WalletSection />
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-8 space-y-6">
              <div className="bg-muted p-6 rounded-lg space-y-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Conseils pour une annonce efficace</h3>
                    <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                      <li>• Choisissez un titre clair et descriptif</li>
                      <li>• Détaillez l'état et les caractéristiques</li>
                      <li>• Ajoutez des photos de qualité</li>
                      <li>• Fixez un prix cohérent avec le marché</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || !isConnected} size="lg">
            {isSubmitting ? "Création en cours..." : "Créer l'annonce"}
          </Button>
        </div>
      </form>
    </Form>
  );
}