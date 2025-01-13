import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

interface Suggestion {
  id: string;
  title: string;
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput);
    setShowSuggestions(false);
  };

  const fetchSuggestions = async (query: string) => {
    if (query.length < 1) {
      setSuggestions([]);
      return;
    }

    const { data, error } = await supabase
      .from("listings")
      .select("id, title")
      .ilike("title", `%${query}%`)
      .eq("status", "active")
      .limit(5);

    if (error) {
      console.error("Error fetching suggestions:", error);
      return;
    }

    setSuggestions(data);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    setShowSuggestions(true);
    fetchSuggestions(value);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    navigate(`/listings/${suggestion.id}`);
    setShowSuggestions(false);
    setSearchInput("");
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input 
          placeholder="Que recherchez-vous ?" 
          className="flex-1"
          value={searchInput}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
        />
        <Button type="submit" className="bg-primary hover:bg-primary/90">
          <Search className="h-5 w-5" />
        </Button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <Card 
          className="absolute z-50 w-full mt-1 bg-white shadow-lg rounded-md overflow-hidden"
          ref={suggestionsRef}
        >
          <ul className="py-2">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion.title}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};