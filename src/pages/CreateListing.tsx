
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { ListingForm } from "@/components/create-listing/ListingForm";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAccount } from 'wagmi';
import DiamondViewer from "@/components/home/DiamondViewer";
import { Loader2 } from "lucide-react";

export default function CreateListing() {
  const { user, loading } = useAuth();
  const { address } = useAccount();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Seulement rediriger si le chargement est terminé et qu'il n'y a pas d'utilisateur
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

  // Afficher un état de chargement pendant la vérification de l'authentification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Ne rendre le composant que si l'utilisateur est connecté
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-48 md:h-64 bg-white overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <DiamondViewer state="processing" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-black">
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

        <div className="md:hidden mt-8 space-y-6">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">Conseils rapides</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="font-medium">•</span>
                  Ajoutez des photos de qualité
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium">•</span>
                  Décrivez précisément l'état
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium">•</span>
                  Fixez un prix réaliste
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
