import { Card, CardContent } from "@/components/ui/card";
import { ProfileHeader } from "./profile/ProfileHeader";
import { ProfileForm } from "./profile/ProfileForm";
import { useProfile } from "./profile/useProfile";

export function UserProfile() {
  const {
    profile,
    isLoading,
    error,
    formData,
    setFormData,
    editing,
    setEditing,
    handleSave,
  } = useProfile();

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div>Erreur: {error.message}</div>;
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
              profile={profile}
              editing={editing}
              onEdit={() => setEditing(true)}
              onSave={handleSave}
              onCancel={() => setEditing(false)}
            />
            <ProfileForm
              profile={profile}
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