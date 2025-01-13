import { FormControl, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Category } from "@/types/category";

interface CategorySelectProps {
  label: string;
  value: string;
  placeholder: string;
  categories: Category[];
  onChange: (value: string) => void;
}

export function CategorySelect({
  label,
  value,
  placeholder,
  categories,
  onChange,
}: CategorySelectProps) {
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <Select value={value} onValueChange={onChange}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
}