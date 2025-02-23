
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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

  const handleAvatarUpdate = async (newAvatarUrl: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      // Mettre à jour le profil avec la nouvelle URL de l'avatar
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: newAvatarUrl })
        .eq("id", user.id);

      if (error) throw error;

      // Mettre à jour l'état local
      setProfile(prev => prev ? {
        ...prev,
        avatar_url: newAvatarUrl,
      } : null);

      toast({
        title: "Succès",
        description: "Photo de profil mise à jour avec succès",
      });

    } catch (error) {
      console.error("Error updating avatar:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la photo de profil",
        variant: "destructive",
      });
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
  };
}
