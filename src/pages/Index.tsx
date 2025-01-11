import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { SearchBar } from "@/components/SearchBar";
import { ListingCard } from "@/components/ListingCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: listings, isLoading } = useQuery({
    queryKey: ["listings", searchQuery],
    queryFn: async () => {
      console.log("Fetching listings with search query:", searchQuery);
      let query = supabase
        .from("listings")
        .select(`
          id,
          title,
          price,
          location,
          images,
          created_at
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching listings:", error);
        throw error;
      }
      
      console.log("Fetched listings:", data);
      return data;
    },
  });

  const handleSearch = (query: string) => {
    console.log("Search query updated:", query);
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SearchBar onSearch={handleSearch} />
        
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Annonces récentes</h2>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : listings && listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  title={listing.title}
                  price={listing.price}
                  location={listing.location}
                  image={listing.images?.[0] || "/placeholder.svg"}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              Aucune annonce trouvée
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;