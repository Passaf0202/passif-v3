import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export const SearchBar = () => {
  return (
    <div className="flex gap-2 max-w-2xl mx-auto p-4">
      <Input 
        placeholder="Que recherchez-vous ?" 
        className="flex-1"
      />
      <Button className="bg-primary hover:bg-primary/90">
        <Search className="h-5 w-5" />
      </Button>
    </div>
  );
};