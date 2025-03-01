
import { Card, CardContent } from "@/components/ui/card";
import { ProfileHeader } from "./profile/ProfileHeader";
import { ProfileForm } from "./profile/ProfileForm";
import { useProfile } from "./profile/useProfile";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { PageHeader } from "./common/PageHeader";
import { Loader2 } from "lucide-react";

export function UserProfile() {
  const {
    loading,
    profile,
    editing,
    formData,
    setFormData,
    setEditing,
    updateProfile,
    handleAvatarUpdate,
    avatarLoading
  } = useProfile();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>;
  }

  if (!profile) {
    return <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg text-gray-600">Profil non trouvé</p>
    </div>;
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
                    {avatarLoading ? (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      </div>
                    ) : (
                      <>
                        <AvatarImage 
                          src={getAvatarUrl(profile.avatar_url)}
                          alt={`${profile.first_name || ''} ${profile.last_name || ''}`}
                        />
                        <AvatarFallback className="text-2xl">
                          {profile.first_name?.[0]}{profile.last_name?.[0]}
                        </AvatarFallback>
                      </>
                    )}
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
                            await handleAvatarUpdate(file);
                          }
                        }}
                      />
                    </div>
                  </Avatar>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-lg font-semibold">{profile.username || 'Utilisateur'}</p>
                  {profile.first_name && profile.last_name && (
                    <p className="text-sm text-gray-500">{profile.first_name} {profile.last_name}</p>
                  )}
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
