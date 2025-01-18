import { Card, CardContent } from "@/components/ui/card";
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
  } = useProfile();

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!profile) {
    return <div>Profil non trouvé</div>;
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="space-y-8">
        <Card>
          <CardContent className="p-6">
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
  );
}