
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ethers } from "ethers";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { amoy } from "@/config/chains";

interface EscrowDetailsProps {
  transactionId: string;
}

export function EscrowDetails({ transactionId }: EscrowDetailsProps) {
  const [transaction, setTransaction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  useEffect(() => {
    const fetchTransaction = async () => {
      console.log('Fetching transaction details for:', transactionId);
      
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          listing:listings!transactions_listing_id_fkey (
            id,
            title,
            wallet_address,
            user:profiles!listings_user_id_fkey (
              id,
              wallet_address
            )
          )
        `)
        .eq("id", transactionId)
        .single();

      if (error) {
        console.error("Error fetching transaction:", error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les détails de la transaction",
          variant: "destructive",
        });
        return;
      }

      console.log("Transaction data:", data);
      
      // On utilise d'abord l'adresse du wallet de l'annonce, sinon celle du profil
      const sellerWalletAddress = data.listing?.wallet_address || data.listing?.user?.wallet_address;
      console.log("Seller wallet address:", sellerWalletAddress);
      
      const enrichedTransaction = {
        ...data,
        seller_wallet_address: sellerWalletAddress
      };
      
      console.log("Enriched transaction with seller wallet:", enrichedTransaction);
      setTransaction(enrichedTransaction);
    };

    fetchTransaction();

    const subscription = supabase
      .channel(`transaction-${transactionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "transactions",
          filter: `id=eq.${transactionId}`,
        },
        (payload) => {
          console.log("Transaction updated:", payload);
          setTransaction((prev: any) => ({ ...prev, ...payload.new }));
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [transactionId, toast]);

  const handleReleaseFunds = async () => {
    try {
      const sellerWalletAddress = transaction?.seller_wallet_address;
      console.log("Attempting to release funds to seller:", sellerWalletAddress);
      
      if (!sellerWalletAddress) {
        console.error("Transaction data:", transaction);
        throw new Error("L'adresse du vendeur est manquante");
      }

      setIsLoading(true);

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
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      const contractAddress = transaction.smart_contract_address;
      const abi = ["function releaseFunds(uint256 txnId)"];
      const contract = new ethers.Contract(contractAddress, abi, signer);

      console.log("Releasing funds with transaction ID:", transaction.blockchain_txn_id);
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
            buyer_confirmation: true,
            released_at: new Date().toISOString(),
          })
          .eq('id', transactionId);

        if (updateError) throw updateError;

        toast({
          title: "Succès",
          description: "Les fonds ont été libérés au vendeur",
        });
      }
    } catch (error: any) {
      console.error('Error releasing funds:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la libération des fonds",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!transaction || !user) return null;

  const isUserBuyer = user.id === transaction.buyer_id;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Paiement sécurisé</h1>
      
      <div className="bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold mb-8">Détails de la transaction</h2>
        
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-2">Article</h3>
            <p className="text-gray-600">{transaction.listing?.title}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Prix</h3>
            <p className="text-gray-600">
              {transaction.amount} €
            </p>
            <p className="text-blue-600">
              ≈ {transaction.crypto_amount} {transaction.token_symbol}
            </p>
          </div>

          {isUserBuyer && transaction.funds_secured && !transaction.buyer_confirmation && (
            <Button
              onClick={handleReleaseFunds}
              disabled={isLoading}
              className="w-full mt-4 bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Libération des fonds en cours...
                </>
              ) : (
                "Libérer les fonds au vendeur"
              )}
            </Button>
          )}

          {transaction.buyer_confirmation && (
            <p className="text-green-600 text-center font-medium">
              Les fonds ont été libérés au vendeur
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
