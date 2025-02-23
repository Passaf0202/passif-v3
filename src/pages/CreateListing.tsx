
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
    navigate("/"); // Redirection vers la page d'accueil
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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white/80 backdrop-blur-md border-b flex items-center px-4">
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
            className="absolute right-2 hover:bg-gray-100/80"
            onClick={handleClose}
          >
            <X className="h-6 w-6" />
          </Button>
        </header>

        <main className="pt-14">
          <div className="relative h-56 flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
            <div className="absolute inset-0 flex items-center justify-center">
              <DiamondViewer state="processing" />
            </div>
            <div className="relative z-10 text-center px-6 mt-4">
              <h1 className="text-4xl font-bold mb-3 bg-white/95 backdrop-blur-md px-6 py-3 rounded-2xl inline-block shadow-sm">
                Créer une annonce
              </h1>
              <p className="text-lg text-gray-700 bg-white/95 backdrop-blur-md px-6 py-3 rounded-2xl inline-block shadow-sm max-w-sm mx-auto">
                Décrivez votre article pour le mettre en vente
              </p>
            </div>
          </div>

          <div className="px-4 pb-16 -mt-6 relative z-20">
            <div className="bg-white shadow-xl rounded-2xl border border-gray-100 p-6">
              <ListingForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="relative h-96 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <DiamondViewer state="processing" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center z-10 -mt-8">
            <h1 className="text-6xl font-bold mb-6 bg-white/95 backdrop-blur-xl px-12 py-4 rounded-2xl inline-block shadow-sm transform hover:scale-105 transition-transform duration-300">
              Créer une annonce
            </h1>
            <p className="text-2xl text-gray-700 bg-white/95 backdrop-blur-xl px-12 py-4 rounded-2xl inline-block shadow-sm max-w-2xl mx-auto transform hover:scale-105 transition-transform duration-300">
              Décrivez votre article pour le mettre en vente
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="absolute top-6 right-6 bg-white/95 backdrop-blur-xl hover:bg-white shadow-sm rounded-full w-12 h-12 transition-all duration-300 hover:scale-110"
          onClick={handleClose}
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      <div className="container max-w-7xl mx-auto px-4 -mt-20 pb-16 relative z-10">
        <div className="bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-2xl">
          <div className="p-8 md:p-12">
            <ListingForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </div>
        </div>
      </div>
    </div>
  );
}
