import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { ListingForm } from "@/components/create-listing/ListingForm";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAccount } from 'wagmi';
import DiamondViewer from "@/components/home/DiamondViewer";

export default function CreateListing() {
  const { user } = useAuth();
  const { address } = useAccount();
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

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-purple-50 to-blue-50 overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <DiamondViewer state="processing" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Créer une annonce
            </h1>
            <p className="mt-2 text-gray-600">
              Décrivez votre article pour le mettre en vente
            </p>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 -mt-12 pb-16">
        <Card className="shadow-xl border-0 overflow-hidden backdrop-blur-sm bg-white/95">
          <CardContent className="p-0">
            <div className="md:flex">
              <div className="md:flex-1 p-6 md:p-8">
                <ListingForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
              </div>

              <div className="hidden md:block md:w-80 bg-gradient-to-b from-gray-50 to-white border-l">
                <div className="p-8 sticky top-0">
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-2xl p-6">
                      <h3 className="font-medium text-lg mb-4">Comment ça marche ?</h3>
                      <ul className="space-y-4 text-sm">
                        <li className="flex gap-3">
                          <div className="flex-none w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">1</div>
                          <p>Décrivez votre article en détail et ajoutez des photos de qualité</p>
                        </li>
                        <li className="flex gap-3">
                          <div className="flex-none w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">2</div>
                          <p>Définissez un prix juste et les options de livraison</p>
                        </li>
                        <li className="flex gap-3">
                          <div className="flex-none w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">3</div>
                          <p>Connectez votre wallet pour recevoir les paiements</p>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-purple-50 rounded-2xl p-6">
                      <h3 className="font-medium text-lg mb-4">Conseils de vente</h3>
                      <ul className="space-y-3 text-sm">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                          <span>Utilisez des mots-clés pertinents</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                          <span>Prenez des photos sous plusieurs angles</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                          <span>Mentionnez l'état exact du produit</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                          <span>Répondez rapidement aux messages</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
