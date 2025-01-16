import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  titleOnly: boolean;
  onTitleOnlyChange: (checked: boolean) => void;
}

export const SearchInput = ({
  value,
  onChange,
  onFocus,
  titleOnly,
  onTitleOnlyChange,
}: SearchInputProps) => {
  return (
    <div className="flex-1">
      <div className="relative">
        <Input
          placeholder="Que recherchez-vous ?"
          className="h-12 text-base rounded-lg bg-gray-100 border-gray-300 focus:border-primary focus:ring-primary pl-10 pr-4"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
        />
        <Search className="h-5 w-5 absolute left-3 top-3.5 text-gray-400" />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Checkbox
          id="titleOnly"
          checked={titleOnly}
          onCheckedChange={(checked) => onTitleOnlyChange(checked as boolean)}
        />
        <Label htmlFor="titleOnly" className="text-sm text-gray-600">
          Rechercher dans le titre uniquement
        </Label>
      </div>
    </div>
  );
};