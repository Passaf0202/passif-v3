import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Camera } from "lucide-react";
import { Navbar } from "./Navbar";

export function UserProfile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
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

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Profil Utilisateur</span>
              <Button
                variant={editing ? "default" : "outline"}
                onClick={() => editing ? updateProfile() : setEditing(true)}
              >
                {editing ? "Sauvegarder" : "Modifier"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback>
                  <User className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>
              {editing && (
                <Button variant="outline" size="sm">
                  <Camera className="h-4 w-4 mr-2" />
                  Changer la photo
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Prénom</label>
                <Input
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  disabled={!editing}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom</label>
                <Input
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  disabled={!editing}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Téléphone</label>
                <Input
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  disabled={!editing}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom d'utilisateur</label>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={!editing}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ville</label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  disabled={!editing}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Pays</label>
                <Input
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  disabled={!editing}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}