
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      console.log("Fetching transaction:", transactionId);
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          listing:listings!transactions_listing_id_fkey (
            title,
            price
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
      setTransaction(data);
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

      if (!transaction.seller_wallet_address) {
        console.error("Transaction data:", transaction);
        throw new Error("L'adresse du vendeur n'a pas été trouvée");
      }

      const contractAddress = transaction.smart_contract_address;
      const abi = ["function releaseFunds(uint256 txnId)"];
      const contract = new ethers.Contract(contractAddress, abi, signer);

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
      } else {
        throw new Error("La libération des fonds a échoué");
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
    <Card>
      <CardHeader>
        <CardTitle>Détails de la transaction</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="font-medium">Article</h3>
          <p className="text-sm text-muted-foreground">
            {transaction.listing?.title}
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Montant</h3>
          <p className="text-sm text-muted-foreground">
            {transaction.amount} {transaction.token_symbol}
          </p>
        </div>

        {isUserBuyer && transaction.funds_secured && !transaction.buyer_confirmation && (
          <Button
            onClick={handleReleaseFunds}
            disabled={isLoading}
            className="w-full"
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

        {!transaction.funds_secured && (
          <p className="text-sm text-yellow-600">
            En attente de la sécurisation des fonds sur la blockchain...
          </p>
        )}

        {transaction.buyer_confirmation && (
          <p className="text-sm text-green-600">
            Les fonds ont été libérés au vendeur
          </p>
        )}
      </CardContent>
    </Card>
  );
}
