
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { ListingDetails as ListingDetailsComponent } from "@/components/listing/ListingDetails";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useAccount, useConnect } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useToast } from "@/components/ui/use-toast";

export default function ListingDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { open } = useWeb3Modal();

  // Tenter de reconnecter le wallet automatiquement
  useEffect(() => {
    const attemptWalletReconnection = async () => {
      try {
        // Vérifier si nous avons un wallet address stocké
        const storedWalletAddress = localStorage.getItem('lastConnectedWallet');
        
        // Si nous avons une adresse stockée et que nous ne sommes pas déjà connectés
        if (storedWalletAddress && !isConnected) {
          console.log("Tentative de reconnexion du wallet...");
          
          // Ouvrir le modal Web3 pour la reconnexion
          await open();
        }
      } catch (error) {
        console.error("Erreur lors de la reconnexion du wallet:", error);
      }
    };

    // Exécuter la tentative de reconnexion
    attemptWalletReconnection();
  }, [isConnected, open]);

  // Sauvegarder l'adresse du wallet quand elle change
  useEffect(() => {
    if (address) {
      localStorage.setItem('lastConnectedWallet', address);
      console.log("Adresse du wallet sauvegardée:", address);
    }
  }, [address]);

  const { data: listing, isLoading } = useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select(`
          *,
          user:profiles!listings_user_id_fkey (
            id,
            full_name,
            avatar_url,
            wallet_address
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleBack = () => {
    navigate('/search');
  };

  if (isLoading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-500">Annonce non trouvée</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto py-8 relative">
        <Button 
          onClick={() => navigate('/search')}
          variant="ghost" 
          size="icon"
          className="absolute left-6 top-4 md:left-8 md:top-12 z-10 hover:bg-white/80 bg-white/60 backdrop-blur-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <ListingDetailsComponent listing={listing} />
      </div>
    </div>
  );
}
