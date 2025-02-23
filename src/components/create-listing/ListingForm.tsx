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
  crypto_currency: z.string().default("POL"),
  crypto_amount: z.number().default(0),
});

type FormValues = z.infer<typeof formSchema>;

interface ListingFormProps {
  onSubmit: (values: any) => Promise<void>;
  isSubmitting: boolean;
}

export function ListingForm({ onSubmit, isSubmitting }: ListingFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      location: "",
      crypto_currency: "POL",
      crypto_amount: 0,
    },
  });

  const { isConnected, address } = useAccount();
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

  const handleSubmit = async (values: FormValues) => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet requis",
        description: "Veuillez connecter votre wallet avant de créer une annonce",
        variant: "destructive",
      });
      return;
    }

    const finalValues = {
      ...values,
      category,
      subcategory,
      subsubcategory,
      ...productDetails,
      ...shippingDetails,
      images,
      wallet_address: address,
      status: "active",
    };

    await onSubmit(finalValues);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-purple-50/50 to-transparent p-6 rounded-2xl">
              <BasicInfoSection 
                form={form} 
                onCategoryChange={handleCategoryChange} 
              />
            </div>

            <div className="bg-gradient-to-br from-blue-50/50 to-transparent p-6 rounded-2xl">
              <ProductDetails
                category={category}
                subcategory={subcategory}
                subsubcategory={subsubcategory}
                onDetailsChange={setProductDetails}
              />
            </div>

            <div className="bg-gradient-to-br from-indigo-50/50 to-transparent p-6 rounded-2xl">
              <DescriptionSection form={form} />
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-gradient-to-br from-pink-50/50 to-transparent p-6 rounded-2xl">
              <ShippingLocationSection
                form={form}
                shippingMethod={shippingDetails.method}
                onShippingChange={setShippingDetails}
                category={category}
              />
            </div>

            <div className="bg-gradient-to-br from-orange-50/50 to-transparent p-6 rounded-2xl">
              <PhotosSection
                images={images}
                onImagesChange={setImages}
                category={category}
              />
            </div>

            <div className="bg-gradient-to-br from-green-50/50 to-transparent p-6 rounded-2xl">
              <WalletSection />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-100">
          <Button 
            type="submit" 
            disabled={isSubmitting || !isConnected} 
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 rounded-full transition-all duration-200 transform hover:scale-105"
          >
            {isSubmitting ? "Création en cours..." : "Créer l'annonce"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
