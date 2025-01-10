import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const formSchema = z.object({
  title: z.string().min(3, "Le titre doit faire au moins 3 caractères"),
  description: z.string().min(10, "La description doit faire au moins 10 caractères"),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Le prix doit être un nombre positif",
  }),
  location: z.string().min(2, "La localisation est requise"),
  category: z.string().min(2, "La catégorie est requise"),
});

const categories = [
  "Véhicules",
  "Immobilier",
  "Multimédia",
  "Maison",
  "Loisirs",
  "Mode",
  "Autres",
];

export default function CreateListing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour créer une annonce",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    // Vérifier si le profil existe
    const checkProfile = async () => {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error || !profile) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la vérification de votre profil",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      setUserProfile(profile);
    };

    checkProfile();
  }, [user, navigate, toast]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      location: "",
      category: "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
  };

  const uploadImages = async () => {
    const uploadedUrls: string[] = [];

    for (const image of images) {
      const fileExt = image.name.split(".").pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from("listings-images")
        .upload(filePath, image);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("listings-images")
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user || !userProfile) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour créer une annonce",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("Starting listing creation with user:", user.id);
      
      // Upload images first
      const imageUrls = await uploadImages();
      console.log("Images uploaded successfully:", imageUrls);

      // Create the listing
      const { error } = await supabase.from("listings").insert({
        title: values.title,
        description: values.description,
        price: Number(values.price),
        location: values.location,
        category: values.category,
        images: imageUrls,
        user_id: user.id,
        status: 'active'
      });

      if (error) {
        console.error("Error creating listing:", error);
        throw error;
      }

      toast({
        title: "Succès",
        description: "Votre annonce a été créée avec succès",
      });

      navigate("/");
    } catch (error) {
      console.error("Error creating listing:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de l'annonce",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || !userProfile) {
    return null;
  }

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Créer une nouvelle annonce</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre</FormLabel>
                    <FormControl>
                      <Input placeholder="Titre de l'annonce" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Décrivez votre article..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Prix en euros"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localisation</FormLabel>
                    <FormControl>
                      <Input placeholder="Ville" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="">Sélectionnez une catégorie</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Images</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Création en cours..." : "Créer l'annonce"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}