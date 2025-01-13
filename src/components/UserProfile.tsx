import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "./Navbar";
import { ProfilePhotoUpload } from "./ProfilePhotoUpload";
import { ProfileHeader } from "./profile/ProfileHeader";
import { ProfileForm } from "./profile/ProfileForm";
import { useProfile } from "./profile/useProfile";

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
  } = useProfile();

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>
              <ProfileHeader
                editing={editing}
                onEditClick={() => setEditing(true)}
                onSaveClick={updateProfile}
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ProfilePhotoUpload
              userId={profile?.id || ""}
              currentAvatarUrl={profile?.avatar_url}
              onAvatarUpdate={handleAvatarUpdate}
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
  );
}