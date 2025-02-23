import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { ListingForm } from "@/components/create-listing/ListingForm";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAccount } from 'wagmi';
import DiamondViewer from "@/components/home/DiamondViewer";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

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
      console.log("Starting listing creation with values:", values);
      console.log("Current user:", user);
      console.log("Current wallet address:", address);

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
          crypto_amount: values.crypto_amount,
          wallet_address: address
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

  const handleClose = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white border-b flex items-center px-4">
          <div className="absolute left-0 right-0 flex justify-center">
            <img 
              src="https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/logos//tradecoiner-logo.svg.png"
              alt="Tradecoiner" 
              className="h-8 w-auto"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2"
            onClick={handleClose}
          >
            <X className="h-6 w-6" />
          </Button>
        </header>

        <main className="pt-14">
          <div className="relative bg-background">
            <div className="absolute inset-0 opacity-10">
              <DiamondViewer state="processing" />
            </div>
            <div className="relative px-4 py-6">
              <h1 className="text-2xl font-bold text-center">
                Déposer une annonce
              </h1>
            </div>
          </div>

          <div className="px-4 pb-16">
            <ListingForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-64 overflow-hidden">
        <div className="absolute inset-0">
          <DiamondViewer state="processing" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold">
              Créer une annonce
            </h1>
            <p className="mt-2 text-gray-600">
              Décrivez votre article pour le mettre en vente
            </p>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 -mt-12 pb-16">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="p-8 md:p-12">
            <ListingForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </div>
        </div>
      </div>
    </div>
  );
}
