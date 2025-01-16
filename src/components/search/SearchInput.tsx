import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  titleOnly: boolean;
  onTitleOnlyChange: (checked: boolean) => void;
  showCheckbox?: boolean;
}

export const SearchInput = ({
  value,
  onChange,
  onFocus,
  titleOnly,
  onTitleOnlyChange,
  showCheckbox = true,
}: SearchInputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="flex-1">
      <div className="relative">
        <Input
          placeholder="Que recherchez-vous ?"
          className="h-12 text-base rounded-lg bg-gray-100 border-gray-300 focus:border-primary focus:ring-primary pl-10 pr-4"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            onFocus();
          }}
          onBlur={() => setIsFocused(false)}
        />
        <Search className="h-5 w-5 absolute left-3 top-3.5 text-gray-400" />
      </div>
    </div>
  );
};