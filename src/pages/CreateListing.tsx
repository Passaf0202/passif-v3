import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListingForm } from "@/components/create-listing/ListingForm";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function CreateListing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const uploadImages = async (images: File[]) => {
    try {
      console.log("Starting image upload process");
      const uploadedUrls: string[] = [];

      for (const image of images) {
        if (!image.type.startsWith('image/')) {
          console.error(`File ${image.name} is not an image (type: ${image.type})`);
          continue;
        }

        const fileExt = image.name.split('.').pop()?.toLowerCase() || '';
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        console.log("Uploading image:", fileName, "type:", image.type);

        const { error: uploadError, data } = await supabase.storage
          .from("listings-images")
          .upload(fileName, image, {
            contentType: image.type,
            upsert: false
          });

        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from("listings-images")
          .getPublicUrl(fileName);

        console.log("Image uploaded successfully:", publicUrl);
        uploadedUrls.push(publicUrl);
      }

      return uploadedUrls;
    } catch (error) {
      console.error("Error in uploadImages:", error);
      throw error;
    }
  };

  const handleSubmit = async (values: any) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour créer une annonce",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("Starting listing creation with values:", values);
      console.log("Current user:", user);

      let imageUrls: string[] = [];
      if (values.images?.length > 0) {
        imageUrls = await uploadImages(values.images);
      }

      console.log("Creating listing with image URLs:", imageUrls);

      const { error: insertError, data: newListing } = await supabase
        .from("listings")
        .insert({
          title: values.title,
          description: values.description,
          price: Number(values.price),
          location: values.location,
          images: imageUrls,
          user_id: user.id,
          status: 'active',
          category: values.category,
          subcategory: values.subcategory,
          subsubcategory: values.subsubcategory,
          brand: values.brand,
          condition: values.condition,
          color: values.color,
          material: values.material,
          shipping_method: values.shipping_method,
          shipping_weight: values.shipping_weight,
          crypto_currency: values.crypto_currency,
          crypto_amount: values.crypto_amount
        })
        .select('*')
        .single();

      if (insertError) {
        console.error("Error inserting listing:", insertError);
        throw insertError;
      }

      console.log("Listing created successfully:", newListing);
      
      toast({
        title: "Succès",
        description: "Votre annonce a été créée avec succès",
      });

      navigate("/");
    } catch (error) {
      console.error("Error in form submission:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de l'annonce",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Créer une nouvelle annonce</CardTitle>
        </CardHeader>
        <CardContent>
          <ListingForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </CardContent>
      </Card>
    </div>
  );
}