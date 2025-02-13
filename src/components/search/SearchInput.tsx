
import { Input } from "@/components/ui/input";
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
      <Input
        placeholder="Rechercher sur TRADECOINER"
        className="h-8 text-sm rounded-full bg-gray-100/80 border-transparent focus:border-transparent focus:ring-0 pl-10 pr-4 transition-all duration-200 placeholder:text-gray-500 min-w-[200px] md:min-w-[280px]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          setIsFocused(true);
          onFocus();
        }}
        onBlur={() => setIsFocused(false)}
      />
    </div>
  );
};
