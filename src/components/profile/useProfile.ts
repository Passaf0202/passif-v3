import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { imageUploadService } from "@/services/imageUploadService";

export interface ProfileData {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  city: string;
  country: string;
  username: string;
  avatar_url: string | null;
}

export function useProfile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    city: "",
    country: "",
    username: "",
  });
  const [avatarLoading, setAvatarLoading] = useState(false);

  useEffect(() => {
    checkUser();
    getProfile();
  }, []);

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
      }
    } catch (error) {
      console.error("Error checking user:", error);
      navigate("/auth");
    }
  }

  async function getProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFormData({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        phone_number: data.phone_number || "",
        city: data.city || "",
        country: data.country || "",
        username: data.username || "",
      });
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le profil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update(formData)
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Profil mis à jour avec succès",
      });
      
      setEditing(false);
      getProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
        variant: "destructive",
      });
    }
  }

  const handleAvatarUpdate = async (file: File) => {
    try {
      setAvatarLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const uploadResult = await imageUploadService.uploadImage(file);
      
      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || "Échec du téléchargement de l'image");
      }
      
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: uploadResult.url })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? {
        ...prev,
        avatar_url: uploadResult.url,
      } : null);

      toast({
        title: "Succès",
        description: "Photo de profil mise à jour avec succès",
      });

    } catch (error: any) {
      console.error("Error updating avatar:", error);
      toast({
        title: "Erreur",
        description: `Impossible de mettre à jour la photo de profil: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setAvatarLoading(false);
    }
  };

  return {
    loading,
    profile,
    editing,
    formData,
    setFormData,
    setEditing,
    updateProfile,
    handleAvatarUpdate,
    avatarLoading
  };
}
