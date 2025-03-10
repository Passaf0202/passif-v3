import { Loader2 } from "lucide-react";
import { ListingCard } from "@/components/ListingCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function ListingsSection() {
  const { toast } = useToast();

  const { data: listings, isLoading, error } = useQuery({
    queryKey: ["listings"],
    queryFn: async () => {
      console.log("Fetching listings...");
      try {
        const { data, error } = await supabase
          .from("listings")
          .select(`
            id,
            title,
            price,
            location,
            images,
            user_id,
            created_at,
            shipping_method,
            crypto_amount,
            crypto_currency,
            wallet_address
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Supabase error:", error);
          toast({
            title: "Erreur",
            description: "Impossible de charger les annonces. Veuillez réessayer.",
            variant: "destructive",
          });
          throw error;
        }
        
        console.log("Listings fetched successfully:", data);
        return data;
      } catch (err) {
        console.error("Error in queryFn:", err);
        throw err;
      }
    },
  });

  if (error) {
    console.error("Query error:", error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Annonces récentes
      </h2>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500">
          Une erreur est survenue lors du chargement des annonces
        </div>
      ) : listings && listings.length > 0 ? (
        <div className="flex flex-wrap gap-4 justify-center">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              id={listing.id}
              title={listing.title}
              price={listing.price}
              location={listing.location}
              image={listing.images?.[0] || "/placeholder.svg"}
              images={listing.images}
              sellerId={listing.user_id}
              shipping_method={listing.shipping_method}
              created_at={listing.created_at}
              crypto_amount={listing.crypto_amount}
              crypto_currency={listing.crypto_currency}
              walletAddress={listing.wallet_address}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          Aucune annonce trouvée
        </p>
      )}
    </div>
  );
}