import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SearchBar } from "@/components/SearchBar";
import { ListingCard } from "@/components/ListingCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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
          user_id,
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-primary/10 to-primary/5 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="text-center relative z-10">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Donnez une seconde vie à vos objets
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Vendez facilement vos articles et découvrez des trésors uniques. 
                Rejoignez notre communauté d'acheteurs et vendeurs responsables.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/create">
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    <Plus className="h-5 w-5 mr-2" />
                    Déposer une annonce
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="lg" variant="outline">
                    Découvrir
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-primary/5 to-transparent" />
          <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-primary/5 to-transparent" />
        </div>

        {/* Search Section */}
        <div className="bg-white py-8">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>

        {/* Listings Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Annonces récentes
          </h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : listings && listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  id={listing.id}
                  title={listing.title}
                  price={listing.price}
                  location={listing.location}
                  image={listing.images?.[0] || "/placeholder.svg"}
                  sellerId={listing.user_id}
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

      <Footer />
    </div>
  );
}

export default Index;