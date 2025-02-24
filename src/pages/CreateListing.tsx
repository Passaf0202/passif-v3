
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

      // Vérifier d'abord si le bucket existe
      const { data: buckets } = await supabase.storage.listBuckets();
      const listingsBucket = buckets?.find(b => b.name === 'listings-images');
      
      if (!listingsBucket) {
        throw new Error("Le bucket de stockage n'existe pas");
      }

      for (const image of images) {
        if (!image.type.startsWith('image/')) {
          console.error(`File ${image.name} is not an image (type: ${image.type})`);
          continue;
        }

        // Validation de la taille du fichier (5MB max)
        if (image.size > 5 * 1024 * 1024) {
          throw new Error(`L'image ${image.name} est trop grande (max 5MB)`);
        }

        const fileExt = image.name.split('.').pop()?.toLowerCase() || '';
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${user?.id}/${fileName}`;

        console.log("Attempting to upload:", filePath);

        // Vérifier si le fichier existe déjà
        const { data: existingFile } = await supabase.storage
          .from('listings-images')
          .list(user?.id || '', {
            search: fileName
          });

        if (existingFile && existingFile.length > 0) {
          console.log("File already exists, will overwrite");
        }

        // Upload avec gestion explicite des erreurs
        const { error: uploadError, data } = await supabase.storage
          .from('listings-images')
          .upload(filePath, image, {
            contentType: image.type,
            upsert: true,
            cacheControl: '3600'
          });

        if (uploadError) {
          console.error("Upload error details:", uploadError);
          
          // Erreur spécifique pour les problèmes de permission
          if (uploadError.message.includes("permission")) {
            throw new Error("Vous n'avez pas les permissions nécessaires pour uploader des images");
          }
          
          throw uploadError;
        }

        // Récupérer l'URL publique seulement si l'upload a réussi
        if (data?.path) {
          const { data: { publicUrl } } = supabase.storage
            .from('listings-images')
            .getPublicUrl(filePath);

          console.log("Successfully uploaded, public URL:", publicUrl);
          uploadedUrls.push(publicUrl);
        }
      }

      return uploadedUrls;
    } catch (error: any) {
      console.error("Error in uploadImages:", error);
      
      // Message d'erreur personnalisé selon le type d'erreur
      const errorMessage = error.message.includes("permission") 
        ? "Problème de permissions lors de l'upload. Veuillez vous reconnecter."
        : "Impossible de télécharger les images. Veuillez réessayer.";
        
      toast({
        title: "Erreur d'upload",
        description: errorMessage,
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
        try {
          imageUrls = await uploadImages(values.images);
        } catch (error) {
          console.error("Failed to upload images:", error);
          return; // Arrêter la création si l'upload échoue
        }
      }

      // Créer l'annonce seulement si les images ont été uploadées avec succès
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
