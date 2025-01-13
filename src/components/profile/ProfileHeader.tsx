import { Button } from "@/components/ui/button";

interface ProfileHeaderProps {
  editing: boolean;
  onEditClick: () => void;
  onSaveClick: () => void;
}

export function ProfileHeader({ editing, onEditClick, onSaveClick }: ProfileHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <span>Profil Utilisateur</span>
      <Button
        variant={editing ? "default" : "outline"}
        onClick={() => editing ? onSaveClick() : onEditClick()}
      >
        {editing ? "Sauvegarder" : "Modifier"}
      </Button>
    </div>
  );
}