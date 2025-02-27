
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

  // Fonction pour créer le bucket si nécessaire
  const ensureBucketExists = async () => {
    try {
      // Vérifier si le bucket existe déjà
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'listings-images');
      
      if (!bucketExists) {
        // Créer le bucket s'il n'existe pas
        const { error } = await supabase.storage.createBucket('listings-images', {
          public: true,
          fileSizeLimit: 5242880, // 5MB
        });
        
        if (error) {
          console.error("Error creating bucket:", error);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error ensuring bucket exists:", error);
      return false;
    }
  };

  const uploadImages = async (images: File[]) => {
    try {
      console.log("Starting image upload process");
      
      // S'assurer que le bucket existe
      const bucketReady = await ensureBucketExists();
      if (!bucketReady) {
        throw new Error("Impossible de préparer le stockage pour les images");
      }
      
      const uploadedUrls: string[] = [];

      for (const image of images) {
        if (!image.type.startsWith('image/')) {
          console.error(`File ${image.name} is not an image (type: ${image.type})`);
          continue;
        }

        const fileExt = image.name.split('.').pop()?.toLowerCase() || '';
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        console.log("Uploading image:", fileName, "type:", image.type);

        // Tentative d'upload avec retry
        let uploadSuccess = false;
        let attempts = 0;
        const maxAttempts = 3;
        
        while (!uploadSuccess && attempts < maxAttempts) {
          attempts++;
          
          try {
            const { error: uploadError, data } = await supabase.storage
              .from("listings-images")
              .upload(fileName, image, {
                contentType: image.type,
                upsert: attempts > 1, // Tenter de remplacer après la première tentative
                cacheControl: "3600" // Faciliter la mise en cache
              });

            if (uploadError) {
              console.error(`Upload attempt ${attempts} failed:`, uploadError);
              
              if (attempts < maxAttempts) {
                console.log(`Retrying upload (${attempts}/${maxAttempts})...`);
                // Attendre un peu avant de réessayer
                await new Promise(resolve => setTimeout(resolve, 1000));
              } else {
                throw uploadError;
              }
            } else {
              uploadSuccess = true;
            }
          } catch (error) {
            console.error(`Upload attempt ${attempts} exception:`, error);
            if (attempts >= maxAttempts) throw error;
          }
        }

        if (!uploadSuccess) {
          throw new Error(`Failed to upload ${image.name} after ${maxAttempts} attempts`);
        }

        // Obtenir l'URL publique
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
          console.log("Uploading images...", values.images.length);
          imageUrls = await uploadImages(values.images);
          console.log("Images uploaded successfully:", imageUrls);
        } catch (error) {
          console.error("Error uploading images:", error);
          toast({
            title: "Erreur",
            description: "Une erreur est survenue lors de l'upload des images. Veuillez réessayer.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Essayer d'insérer l'annonce avec les URLs d'images
      const { error: insertError, data: insertedListing } = await supabase
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
          crypto_amount: values.crypto_amount,
          wallet_address: address
        })
        .select('*')
        .single();

      if (insertError) {
        console.error("Error inserting listing:", insertError);
        
        // Si l'insertion échoue, essayer de nettoyer les images téléchargées
        if (imageUrls.length > 0) {
          try {
            console.log("Cleaning up uploaded images...");
            // Convertir les URLs en noms de fichiers
            const fileNames = imageUrls.map(url => {
              const parts = url.split('/');
              return parts[parts.length - 1];
            });
            
            // Essayer de supprimer les fichiers
            for (const fileName of fileNames) {
              await supabase.storage
                .from("listings-images")
                .remove([fileName]);
            }
            console.log("Cleanup completed");
          } catch (cleanupError) {
            console.error("Error cleaning up images:", cleanupError);
          }
        }
        
        throw insertError;
      }
      
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
