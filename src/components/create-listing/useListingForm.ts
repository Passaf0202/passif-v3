
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAccount } from 'wagmi';
import { useToast } from "@/components/ui/use-toast";
import { formSchema, FormValues } from "./schema";

interface UseListingFormProps {
  onSubmit: (values: any) => Promise<void>;
}

export function useListingForm({ onSubmit }: UseListingFormProps) {
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

  return {
    form,
    category,
    subcategory,
    subsubcategory,
    images,
    handleCategoryChange,
    handleSubmit,
    setImages,
    setProductDetails,
    setShippingDetails,
    isConnected,
    shippingDetails,
  };
}
