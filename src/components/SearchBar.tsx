import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, History, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

interface Suggestion {
  id: string;
  title: string;
  category?: string;
  isRecent?: boolean;
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [titleOnly, setTitleOnly] = useState(false);
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
    
    // Save to recent searches
    const recentSearches = JSON.parse(localStorage.getItem("recentSearches") || "[]");
    const newSearch = { query: searchInput, timestamp: new Date().toISOString() };
    const updatedSearches = [newSearch, ...recentSearches.slice(0, 4)];
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  const fetchSuggestions = async (query: string) => {
    if (query.length < 1) {
      setSuggestions([]);
      return;
    }

    // Get recent searches
    const recentSearches = JSON.parse(localStorage.getItem("recentSearches") || "[]")
      .map((search: any) => ({
        id: search.timestamp,
        title: search.query,
        isRecent: true
      }))
      .filter((search: Suggestion) => 
        search.title.toLowerCase().includes(query.toLowerCase())
      );

    // Fetch real listings for suggestions
    const { data: listings } = await supabase
      .from("listings")
      .select("id, title, category")
      .ilike("title", `%${query}%`)
      .eq("status", "active")
      .limit(3);

    // Add some smart suggestions based on common patterns
    const smartSuggestions = [
      {
        id: "smart-1",
        title: `${query} occasion`,
        category: "Toutes catégories"
      },
      {
        id: "smart-2",
        title: `${query} pas cher`,
        category: "Toutes catégories"
      },
      {
        id: "smart-3",
        title: `${query} professionnel`,
        category: "Toutes catégories"
      }
    ];

    const allSuggestions = [
      ...recentSearches,
      ...(listings || []).map(l => ({
        id: l.id,
        title: l.title,
        category: l.category
      })),
      ...smartSuggestions
    ];

    setSuggestions(allSuggestions.slice(0, 8));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    setShowSuggestions(true);
    fetchSuggestions(value);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (suggestion.id.startsWith("smart-")) {
      setSearchInput(suggestion.title);
      onSearch(suggestion.title);
    } else {
      navigate(`/listings/${suggestion.id}`);
    }
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <Input 
            placeholder="Que recherchez-vous ?" 
            className="flex-1 h-12 text-base rounded-lg bg-gray-100 border-gray-300 focus:border-primary focus:ring-primary pl-4 pr-10"
            value={searchInput}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
          />
          <div className="absolute right-3 top-3.5">
            <Checkbox
              id="titleOnly"
              checked={titleOnly}
              onCheckedChange={(checked) => setTitleOnly(checked as boolean)}
            />
          </div>
        </div>
        <Button type="submit" size="icon" className="h-12 w-12 bg-primary hover:bg-primary/90 rounded-lg">
          <Search className="h-5 w-5" />
        </Button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <Card 
          className="absolute z-50 w-full mt-1 bg-white shadow-lg rounded-md overflow-hidden"
          ref={suggestionsRef}
        >
          <div className="py-2">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion.isRecent ? (
                  <History className="h-4 w-4 text-gray-400" />
                ) : suggestion.id.startsWith("smart-") ? (
                  <Sparkles className="h-4 w-4 text-primary" />
                ) : (
                  <Search className="h-4 w-4 text-gray-400" />
                )}
                <div>
                  <div className="text-sm font-medium">{suggestion.title}</div>
                  {suggestion.category && (
                    <div className="text-xs text-gray-500">
                      dans {suggestion.category}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {showSuggestions && suggestions.length === 0 && searchInput.length > 0 && (
        <Card className="absolute z-50 w-full mt-1 bg-white shadow-lg rounded-md p-4">
          <p className="text-sm text-gray-500 text-center">
            Aucun résultat trouvé pour "{searchInput}". Soyez le premier à créer une annonce !
          </p>
          <Button 
            className="w-full mt-3"
            onClick={() => navigate("/create")}
          >
            Créer une annonce
          </Button>
        </Card>
      )}
    </div>
  );
};