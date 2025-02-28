
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

  // État pour gérer l'URL de l'avatar avec timestamp
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!profile) {
    return <div>Profil non trouvé</div>;
  }

  // Ajouter un timestamp à l'URL pour éviter la mise en cache
  const getAvatarUrl = (url: string | null) => {
    if (!url) return undefined;
    const timestamp = new Date().getTime();
    return `${url}?t=${timestamp}`;
  };

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
                      src={getAvatarUrl(avatarUrl || profile.avatar_url)}
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
                            // Créer un nom de fichier unique avec timestamp
                            const timestamp = Date.now();
                            const fileExt = file.name.split('.').pop();
                            const fileName = `${profile.id}/${timestamp}.${fileExt}`;

                            // Supprimer l'ancien avatar s'il existe
                            if (profile.avatar_url) {
                              const oldPath = profile.avatar_url.split('/').pop();
                              if (oldPath) {
                                await supabase.storage
                                  .from('avatars')
                                  .remove([`${profile.id}/${oldPath}`]);
                              }
                            }

                            // Upload du nouveau fichier
                            const { data, error } = await supabase.storage
                              .from('avatars')
                              .upload(fileName, file, {
                                upsert: true,
                                cacheControl: 'no-cache'
                              });
                              
                            if (error) {
                              console.error('Error uploading avatar:', error);
                              return;
                            }

                            // Récupération de l'URL publique
                            const { data: { publicUrl } } = supabase.storage
                              .from('avatars')
                              .getPublicUrl(fileName);

                            // Mise à jour du profil avec la nouvelle URL
                            await handleAvatarUpdate(publicUrl);
                            // Mise à jour de l'URL locale avec timestamp
                            setAvatarUrl(publicUrl);
                          }
                        }}
                      />
                    </div>
                  </Avatar>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-lg font-semibold">{profile.username}</p>
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
