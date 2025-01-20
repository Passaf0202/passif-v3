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
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log("Checking user session:", user);
      
      if (userError) {
        console.error("Error checking user:", userError);
        throw userError;
      }

      if (!user) {
        console.log("No user found, redirecting to auth");
        navigate("/auth");
      }
    } catch (error) {
      console.error("Error in checkUser:", error);
      navigate("/auth");
    }
  }

  async function getProfile() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log("Getting profile for user:", user);
      
      if (userError) throw userError;
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }

      console.log("Profile data fetched:", data);
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
      console.error("Error in getProfile:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le profil. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile() {
    try {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      
      if (!user) {
        navigate("/auth");
        return;
      }

      console.log("Updating profile for user:", user.id);
      console.log("Update data:", formData);

      const { error } = await supabase
        .from("profiles")
        .update(formData)
        .eq("id", user.id);

      if (error) {
        console.error("Error updating profile:", error);
        throw error;
      }

      toast({
        title: "Succès",
        description: "Profil mis à jour avec succès",
      });
      
      setEditing(false);
      await getProfile();
    } catch (error) {
      console.error("Error in updateProfile:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    setProfile(prev => prev ? {
      ...prev,
      avatar_url: newAvatarUrl,
    } : null);
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