
import { Card, CardContent } from "@/components/ui/card";
import { ProfileHeader } from "./profile/ProfileHeader";
import { ProfileForm } from "./profile/ProfileForm";
import { useProfile } from "./profile/useProfile";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import DiamondViewer from "./home/DiamondViewer";

export function UserProfile() {
  const navigate = useNavigate();
  const {
    loading,
    profile,
    editing,
    formData,
    setFormData,
    setEditing,
    updateProfile,
    handleAvatarUpdate
  } = useProfile();

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!profile) {
    return <div>Profil non trouvé</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative">
        <div className="absolute inset-0">
          <DiamondViewer state="initial" />
        </div>
        
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10"
        >
          <X className="h-6 w-6" />
        </Button>

        <div className="relative pt-16 pb-8 text-center">
          <h1 className="text-3xl font-bold highlight-stabilo inline-block px-4 py-1">
            Profil utilisateur
          </h1>
        </div>
      </div>

      <div className="container max-w-4xl py-8 relative z-10">
        <div className="space-y-8">
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col items-center mb-8">
                <div className="relative group">
                  <Avatar className="h-32 w-32 cursor-pointer">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="text-2xl">
                      {profile.first_name?.[0]}{profile.last_name?.[0]}
                    </AvatarFallback>
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label htmlFor="avatar-upload" className="text-white text-sm cursor-pointer">
                        Changer la photo
                      </label>
                      <input
                        type="file"
                        id="avatar-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const { data, error } = await supabase.storage
                              .from('avatars')
                              .upload(`${profile.id}/${Date.now()}`, file);
                              
                            if (error) {
                              console.error('Error uploading avatar:', error);
                              return;
                            }

                            const { data: { publicUrl } } = supabase.storage
                              .from('avatars')
                              .getPublicUrl(data.path);

                            handleAvatarUpdate(publicUrl);
                          }
                        }}
                      />
                    </div>
                  </Avatar>
                </div>
              </div>

              <ProfileHeader
                editing={editing}
                onEditClick={() => setEditing(true)}
                onSaveClick={updateProfile}
              />
              <ProfileForm
                formData={formData}
                editing={editing}
                onChange={setFormData}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
