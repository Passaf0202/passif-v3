
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ethers } from "ethers";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { amoy } from "@/config/chains";

export default function ReleaseFunds() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  
  const { 
    data: transaction,
    isLoading,
    error
  } = useQuery({
    queryKey: ['transaction', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          listing:listings!transactions_listing_id_fkey (
            id,
            title,
            price,
            crypto_amount,
            wallet_address,
            user:profiles!listings_user_id_fkey (
              id,
              full_name,
              wallet_address
            )
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Transaction non trouvée");

      return {
        ...data,
        seller_wallet_address: data.seller_wallet_address || data.listing?.wallet_address || data.listing?.user?.wallet_address
      };
    },
    enabled: !!id && !!user?.id
  });

  const handleReleaseFunds = async () => {
    try {
      if (!transaction?.blockchain_txn_id) {
        throw new Error("ID de transaction blockchain manquant");
      }

      if (!transaction?.smart_contract_address) {
        throw new Error("Adresse du contrat manquante");
      }

      if (chain?.id !== amoy.id) {
        if (!switchNetwork) {
          throw new Error("Impossible de changer de réseau automatiquement");
        }
        await switchNetwork(amoy.id);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (!window.ethereum) {
        throw new Error("MetaMask n'est pas installé");
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // ABI minimal pour la fonction releaseFunds
      const abi = ["function releaseFunds(uint256 txnId)"];
      const contract = new ethers.Contract(transaction.smart_contract_address, abi, signer);

      console.log("Transaction ID for release:", transaction.blockchain_txn_id);
      const tx = await contract.releaseFunds(transaction.blockchain_txn_id);
      console.log("Release funds transaction sent:", tx.hash);

      const receipt = await tx.wait();
      console.log("Transaction receipt:", receipt);

      if (receipt.status === 1) {
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            status: 'completed',
            escrow_status: 'completed',
            released_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (updateError) throw updateError;

        toast({
          title: "Succès",
          description: "Les fonds ont été libérés au vendeur"
        });
        
        navigate(`/listings/${transaction.listing.id}`);
      }
    } catch (error: any) {
      console.error('Error releasing funds:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la libération des fonds",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-2">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertDescription>
              Cette transaction n'existe pas ou n'est plus disponible
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate('/')} variant="outline" className="mt-4">
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <h1 className="text-2xl font-bold">Libération des fonds</h1>
          
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold mb-8">Détails de la transaction</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-2">Article</h3>
                <p className="text-gray-600">{transaction.listing?.title}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Prix</h3>
                <p className="text-gray-600">{transaction.amount} €</p>
                <p className="text-blue-600">≈ {transaction.listing?.crypto_amount} {transaction.token_symbol}</p>
              </div>

              <Button
                onClick={handleReleaseFunds}
                className="w-full mt-4 bg-primary hover:bg-primary/90"
              >
                Libérer les fonds au vendeur
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
