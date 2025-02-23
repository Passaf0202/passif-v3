
import { Card, CardContent } from "@/components/ui/card";
import { ProfileHeader } from "./profile/ProfileHeader";
import { ProfileForm } from "./profile/ProfileForm";
import { useProfile } from "./profile/useProfile";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "./common/PageHeader";
import { useState } from "react";

export function UserProfile() {
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
  
  // Ajout d'un état pour forcer le rafraîchissement de l'avatar
  const [avatarKey, setAvatarKey] = useState(0);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!profile) {
    return <div>Profil non trouvé</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Profil utilisateur" 
        diamondScale={4.5} 
        showLogo={false}
        titleClassName="px-2"
      />

      <div className="container max-w-4xl py-8 relative z-10">
        <div className="space-y-8">
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col items-center mb-8">
                <div className="relative group">
                  <Avatar className="h-32 w-32 cursor-pointer">
                    <AvatarImage 
                      key={avatarKey} 
                      src={profile.avatar_url || undefined}
                    />
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

                            await handleAvatarUpdate(publicUrl);
                            // Force le rafraîchissement de l'avatar
                            setAvatarKey(prev => prev + 1);
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
