import { Card } from "@/components/ui/card";
import { History, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Suggestion } from "./types";

interface SearchSuggestionsProps {
  suggestions: Suggestion[];
  searchInput: string;
  showSuggestions: boolean;
  onSuggestionClick: (suggestion: Suggestion) => void;
  suggestionsRef: React.RefObject<HTMLDivElement>;
}

export const SearchSuggestions = ({
  suggestions,
  searchInput,
  showSuggestions,
  onSuggestionClick,
  suggestionsRef,
}: SearchSuggestionsProps) => {
  const navigate = useNavigate();

  if (!showSuggestions) return null;

  if (suggestions.length === 0 && searchInput.length > 0) {
    return (
      <Card className="absolute z-50 w-full mt-1 bg-white shadow-lg rounded-md p-4">
        <p className="text-sm text-gray-500 text-center">
          Aucun résultat trouvé pour "{searchInput}". Soyez le premier à créer une annonce !
        </p>
        <Button className="w-full mt-3" onClick={() => navigate("/create")}>
          Créer une annonce
        </Button>
      </Card>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <Card className="absolute z-50 w-full mt-1 bg-white shadow-lg rounded-md overflow-hidden" ref={suggestionsRef}>
      <div className="py-2">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3"
            onClick={() => onSuggestionClick(suggestion)}
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
  );
};