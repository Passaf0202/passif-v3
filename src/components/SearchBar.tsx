
import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SearchInput } from "./search/SearchInput";
import { SearchSuggestions } from "./search/SearchSuggestions";
import { useSearchSuggestions } from "./search/useSearchSuggestions";
import { Suggestion } from "./search/types";

interface SearchBarProps {
  onSearch: (query: string, titleOnly: boolean) => void;
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [searchInput, setSearchInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [titleOnly, setTitleOnly] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const suggestions = useSearchSuggestions(searchInput);

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
    onSearch(searchInput, titleOnly);
    setShowSuggestions(false);
    
    const recentSearches = JSON.parse(localStorage.getItem("recentSearches") || "[]");
    const newSearch = { query: searchInput, timestamp: new Date().toISOString() };
    const updatedSearches = [newSearch, ...recentSearches.slice(0, 4)];
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (suggestion.id.startsWith("smart-")) {
      setSearchInput(suggestion.title);
      onSearch(suggestion.title, titleOnly);
    } else {
      navigate(`/listings/${suggestion.id}`);
    }
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="flex w-full">
        <div className="relative w-full group">
          <SearchInput
            value={searchInput}
            onChange={(value) => {
              setSearchInput(value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            titleOnly={titleOnly}
            onTitleOnlyChange={setTitleOnly}
            showCheckbox={false}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none transition-opacity group-hover:opacity-100 opacity-70" />
        </div>
      </form>

      <SearchSuggestions
        suggestions={suggestions}
        searchInput={searchInput}
        showSuggestions={showSuggestions}
        onSuggestionClick={handleSuggestionClick}
        suggestionsRef={suggestionsRef}
        titleOnly={titleOnly}
        onTitleOnlyChange={setTitleOnly}
      />
    </div>
  );
};
