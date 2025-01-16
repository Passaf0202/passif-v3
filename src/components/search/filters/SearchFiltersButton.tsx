import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SearchFiltersContent } from "./SearchFiltersContent";
import { SearchFilters } from "../types";

interface SearchFiltersButtonProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

export const SearchFiltersButton = ({ filters, onFiltersChange }: SearchFiltersButtonProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtres
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Filtres</SheetTitle>
        </SheetHeader>
        <SearchFiltersContent filters={filters} onFiltersChange={onFiltersChange} />
      </SheetContent>
    </Sheet>
  );
};