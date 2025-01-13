import { Input } from "@/components/ui/input";

interface ProfileFormData {
  first_name: string;
  last_name: string;
  phone_number: string;
  city: string;
  country: string;
  username: string;
}

interface ProfileFormProps {
  formData: ProfileFormData;
  editing: boolean;
  onChange: (formData: ProfileFormData) => void;
}

export function ProfileForm({ formData, editing, onChange }: ProfileFormProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Prénom</label>
        <Input
          value={formData.first_name}
          onChange={(e) => onChange({ ...formData, first_name: e.target.value })}
          disabled={!editing}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Nom</label>
        <Input
          value={formData.last_name}
          onChange={(e) => onChange({ ...formData, last_name: e.target.value })}
          disabled={!editing}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Téléphone</label>
        <Input
          value={formData.phone_number}
          onChange={(e) => onChange({ ...formData, phone_number: e.target.value })}
          disabled={!editing}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Nom d'utilisateur</label>
        <Input
          value={formData.username}
          onChange={(e) => onChange({ ...formData, username: e.target.value })}
          disabled={!editing}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Ville</label>
        <Input
          value={formData.city}
          onChange={(e) => onChange({ ...formData, city: e.target.value })}
          disabled={!editing}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Pays</label>
        <Input
          value={formData.country}
          onChange={(e) => onChange({ ...formData, country: e.target.value })}
          disabled={!editing}
        />
      </div>
    </div>
  );
}