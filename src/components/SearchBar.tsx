import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [searchInput, setSearchInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-2xl mx-auto p-4">
      <Input 
        placeholder="Que recherchez-vous ?" 
        className="flex-1"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />
      <Button type="submit" className="bg-primary hover:bg-primary/90">
        <Search className="h-5 w-5" />
      </Button>
    </form>
  );
};