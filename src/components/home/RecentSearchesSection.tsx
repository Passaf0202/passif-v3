import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function RecentSearchesSection() {
  const [recentSearches, setRecentSearches] = useState<Array<{ query: string, timestamp: string }>>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const searches = JSON.parse(localStorage.getItem("recentSearches") || "[]");
    setRecentSearches(searches);
  }, []);

  if (recentSearches.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold text-gray-900">Recherches récentes</h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {recentSearches.map((search, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 hover:bg-primary/5"
                  onClick={() => navigate(`/search?q=${encodeURIComponent(search.query)}`)}
                >
                  <Search className="h-4 w-4" />
                  <span className="truncate">{search.query}</span>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}