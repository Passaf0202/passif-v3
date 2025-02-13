
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const LogoUploader = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // Upload to Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const { error: uploadError, data } = await supabase.storage
        .from('logos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      // Update site settings
      const { error: updateError } = await supabase
        .from('site_settings')
        .update({ value: { url: publicUrl } })
        .eq('key', 'logo');

      if (updateError) throw updateError;

      toast({
        title: "Logo mis à jour",
        description: "Le nouveau logo a été téléchargé avec succès.",
      });

      // Invalidate the logo query to force a refresh
      queryClient.invalidateQueries({ queryKey: ['site-settings', 'logo'] });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du téléchargement du logo.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-lg font-semibold">Changer le logo</h2>
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          disabled={isUploading}
          className="relative"
          onClick={() => document.getElementById('logo-upload')?.click()}
        >
          {isUploading ? "Téléchargement..." : "Sélectionner un logo"}
        </Button>
        <input
          type="file"
          id="logo-upload"
          className="hidden"
          accept="image/*"
          onChange={handleFileUpload}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        Format recommandé : PNG ou SVG, taille max 2MB
      </p>
    </div>
  );
};
