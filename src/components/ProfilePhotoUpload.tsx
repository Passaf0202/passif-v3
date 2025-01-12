import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Upload, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ProfilePhotoUploadProps {
  userId: string;
  currentAvatarUrl: string | null;
  onAvatarUpdate: (url: string) => void;
}

export function ProfilePhotoUpload({ userId, currentAvatarUrl, onAvatarUpdate }: ProfilePhotoUploadProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const uploadAvatar = async (file: File) => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      onAvatarUpdate(publicUrl);
      
      toast({
        title: "Photo de profil mise à jour",
        description: "Votre photo de profil a été mise à jour avec succès",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la photo de profil",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      uploadAvatar(event.target.files[0]);
    }
  };

  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      if (e.target instanceof HTMLInputElement && e.target.files?.[0]) {
        uploadAvatar(e.target.files[0]);
      }
    };
    input.click();
  };

  return (
    <div className="flex items-center space-x-4">
      <Avatar className="h-20 w-20">
        <AvatarImage src={currentAvatarUrl || undefined} />
        <AvatarFallback>
          <User className="h-10 w-10" />
        </AvatarFallback>
      </Avatar>
      <div className="flex gap-2">
        <input
          type="file"
          id="avatar-upload"
          className="hidden"
          accept="image/*"
          onChange={handleFileUpload}
        />
        <label htmlFor="avatar-upload">
          <Button variant="outline" size="sm" disabled={uploading} asChild>
            <span>
              <Upload className="h-4 w-4 mr-2" />
              Choisir une photo
            </span>
          </Button>
        </label>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCameraCapture}
          disabled={uploading}
        >
          <Camera className="h-4 w-4 mr-2" />
          Prendre une photo
        </Button>
      </div>
    </div>
  );
}