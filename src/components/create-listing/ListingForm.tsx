
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ProductDetails } from "@/components/ProductDetails";
import { BasicInfoSection } from "./BasicInfoSection";
import { DescriptionSection } from "./DescriptionSection";
import { ShippingLocationSection } from "./ShippingLocationSection";
import { PhotosSection } from "./PhotosSection";
import { WalletSection } from "./WalletSection";
import { useListingForm } from "./useListingForm";

interface ListingFormProps {
  onSubmit: (values: any) => Promise<void>;
  isSubmitting: boolean;
}

export function ListingForm({ onSubmit, isSubmitting }: ListingFormProps) {
  const {
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
  } = useListingForm({ onSubmit });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-6">
          {/* Section 1: Informations de base */}
          <BasicInfoSection 
            form={form} 
            onCategoryChange={handleCategoryChange} 
          />

          {/* Section 2: Description et Prix */}
          <DescriptionSection form={form} />

          {/* Section 3: Photos */}
          <PhotosSection
            images={images}
            onImagesChange={setImages}
            category={category}
          />

          {/* Section 4: Détails du produit */}
          <ProductDetails
            category={category}
            subcategory={subcategory}
            subsubcategory={subsubcategory}
            onDetailsChange={setProductDetails}
          />

          {/* Section 5: Livraison et localisation */}
          <ShippingLocationSection
            form={form}
            shippingMethod={shippingDetails.method}
            onShippingChange={setShippingDetails}
            category={category}
          />

          {/* Section 6: Wallet */}
          <WalletSection />
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-100">
          <Button 
            type="submit" 
            disabled={isSubmitting || !isConnected} 
            size="lg"
            className="bg-black hover:bg-black/90 text-white px-8 py-3 rounded-full transition-all duration-200 transform hover:scale-105 min-w-[200px]"
          >
            {isSubmitting ? "Création en cours..." : "Créer l'annonce"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
