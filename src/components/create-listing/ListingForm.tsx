
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ProductDetails } from "@/components/ProductDetails";
import { BasicInfoSection } from "./BasicInfoSection";
import { DescriptionSection } from "./DescriptionSection";
import { ShippingLocationSection } from "./ShippingLocationSection";
import { PhotosSection } from "./PhotosSection";
import { WalletSection } from "./WalletSection";
import { useListingForm } from "./useListingForm";
import { PriceDetails } from "@/components/listing/PriceDetails";
import { useCryptoConversion } from "@/hooks/useCryptoConversion";

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

  const price = form.watch("price");
  const cryptoAmount = useCryptoConversion(Number(price));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-6">
          <BasicInfoSection 
            form={form} 
            onCategoryChange={handleCategoryChange} 
          />

          <DescriptionSection form={form} />

          {/* Bloc Prix et Crypto */}
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

          <PhotosSection
            images={images}
            onImagesChange={setImages}
            category={category}
          />

          <ProductDetails
            category={category}
            subcategory={subcategory}
            subsubcategory={subsubcategory}
            onDetailsChange={setProductDetails}
          />

          <ShippingLocationSection
            form={form}
            shippingMethod={shippingDetails.method}
            onShippingChange={setShippingDetails}
            category={category}
          />

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
