
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAccount } from 'wagmi';
import { useIsMobile } from "@/hooks/use-mobile";
import { LoadingState } from "@/components/create-listing/LoadingState";
import { MobileCreateListing } from "@/components/create-listing/MobileCreateListing";
import { DesktopCreateListing } from "@/components/create-listing/DesktopCreateListing";

export default function CreateListing() {
  const { user, loading } = useAuth();
  const { address } = useAccount();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!loading && !user) {
      localStorage.setItem('redirectAfterAuth', location.pathname);
      navigate("/auth");
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour créer une annonce",
      });
    }
  }, [user, loading, navigate, location.pathname, toast]);

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
        const filePath = `${user?.id}/${fileName}`; // Utiliser l'ID de l'utilisateur comme dossier

        console.log("Uploading file:", {
          name: image.name,
          type: image.type,
          size: image.size,
          path: filePath
        });

        const { error: uploadError, data } = await supabase.storage
          .from('listings-images')
          .upload(filePath, image, {
            contentType: image.type,
            upsert: true,
            cacheControl: '3600'
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw new Error(uploadError.message);
        }

        console.log("Upload successful, data:", data);

        const { data: { publicUrl } } = supabase.storage
          .from('listings-images')
          .getPublicUrl(filePath);

        console.log("Generated public URL:", publicUrl);
        uploadedUrls.push(publicUrl);
      }

      console.log("All images uploaded successfully:", uploadedUrls);
      return uploadedUrls;
    } catch (error: any) {
      console.error("Error in uploadImages:", error);
      toast({
        title: "Erreur lors de l'upload",
        description: error.message || "Une erreur est survenue lors de l'upload des images",
        variant: "destructive",
      });
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

    if (!address) {
      toast({
        title: "Erreur",
        description: "Vous devez connecter votre wallet pour créer une annonce",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      let imageUrls: string[] = [];
      
      if (values.images?.length > 0) {
        console.log("Processing images:", values.images.length);
        try {
          imageUrls = await uploadImages(values.images);
          console.log("Images uploaded successfully:", imageUrls);
        } catch (error) {
          console.error("Failed to upload images:", error);
          return;
        }
      }

      console.log("Creating listing with data:", {
        ...values,
        imageUrls
      });

      const { error: insertError } = await supabase
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
          crypto_currency: values.crypto_currency || 'POL',
          crypto_amount: values.crypto_amount || 0,
          wallet_address: address
        });

      if (insertError) {
        console.error("Error inserting listing:", insertError);
        throw insertError;
      }
      
      toast({
        title: "Succès",
        description: "Votre annonce a été créée avec succès",
      });

      navigate("/");
    } catch (error: any) {
      console.error("Error in form submission:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création de l'annonce",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    navigate("/");
  };

  if (loading) return <LoadingState />;
  if (!user) return null;

  return isMobile ? (
    <MobileCreateListing
      onClose={handleClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  ) : (
    <DesktopCreateListing
      onClose={handleClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
