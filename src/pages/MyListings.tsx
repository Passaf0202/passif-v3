
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, PenLine, Trash2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { SearchResults } from "@/components/search/SearchResults";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const MyListings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: listings, isLoading, refetch } = useQuery({
    queryKey: ["my-listings", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching listings:", error);
        throw error;
      }

      return data;
    },
    enabled: !!user,
  });

  const deleteListing = async (listingId: string) => {
    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("id", listingId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'annonce",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Succès",
      description: "Annonce supprimée avec succès",
    });
    refetch();
  };

  const handleEdit = (listingId: string) => {
    navigate(`/edit-listing/${listingId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6 inline-block highlight-stabilo">
          Mes Annonces
        </h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : listings && listings.length > 0 ? (
          <div className="space-y-6">
            <SearchResults 
              listings={listings} 
              showFilters={false}
              actionButtons={(listingId) => (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(listingId)}
                  >
                    <PenLine className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteListing(listingId)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Supprimer
                  </Button>
                </div>
              )}
            />
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              Aucune annonce
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Commencez par créer votre première annonce
            </p>
            <div className="mt-6">
              <Button onClick={() => navigate('/create')}>
                Créer une annonce
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyListings;
