
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ethers } from "ethers";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { amoy } from "@/config/chains";
import { Loader2 } from "lucide-react";

const ESCROW_ABI = [
  "function releaseFunds(uint256 txnId)",
  "function getTransaction(uint256 txnId) view returns (address buyer, address seller, uint256 amount, bool isFunded, bool isCompleted)",
  "function transactions(uint256) view returns (address buyer, address seller, uint256 amount, bool isFunded, bool isCompleted)"
];

interface EscrowDetailsProps {
  transactionId: string;
}

export function EscrowDetails({ transactionId }: EscrowDetailsProps) {
  const [transaction, setTransaction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const { toast } = useToast();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  
  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setIsFetching(true);
        
        // First, try to fetch from Supabase
        const { data: txnData, error: txnError } = await supabase
          .from("transactions")
          .select(`
            *,
            listings (
              *
            ),
            buyer:profiles!transactions_buyer_id_fkey (
              *
            ),
            seller:profiles!transactions_seller_id_fkey (
              *
            )
          `)
          .eq("id", transactionId)
          .maybeSingle();

        if (txnError) {
          console.error("Error fetching transaction:", txnError);
          throw new Error("Impossible de charger les détails de la transaction");
        }

        if (!txnData) {
          // If not found in Supabase, try to fetch from blockchain
          if (!window.ethereum) {
            throw new Error("MetaMask n'est pas installé");
          }

          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const contract = new ethers.Contract(
            "0xe35a0cebf608bff98bcf99093b02469eea2cb38c",
            ESCROW_ABI,
            provider
          );

          // Fetch latest transaction count and iterate backwards
          const latestBlock = await provider.getBlockNumber();
          const events = await contract.queryFilter('*', latestBlock - 1000, latestBlock);
          
          console.log("Found blockchain events:", events);

          // If we find matching transaction data, create record in Supabase
          if (events.length > 0) {
            // Fetch transaction details from the contract
            const txn = await contract.getTransaction(transactionId);
            console.log("Transaction details from contract:", txn);

            const { error: createError } = await supabase
              .from('transactions')
              .insert({
                id: transactionId,
                blockchain_txn_id: '0', // Will be updated by trigger
                status: 'pending',
                escrow_status: 'pending',
                amount: ethers.utils.formatEther(txn.amount || '0'),
                commission_amount: 0, // Default commission amount
                token_symbol: 'ETH', // Default token
                can_be_cancelled: true,
                funds_secured: false,
                buyer_confirmation: false,
                seller_confirmation: false
              });

            if (createError) {
              console.error("Error creating transaction:", createError);
              throw new Error("Erreur lors de la création de la transaction");
            }

            // Retry fetching the newly created transaction
            const { data: newTxnData, error: refetchError } = await supabase
              .from("transactions")
              .select(`
                *,
                listings (
                  *
                ),
                buyer:profiles!transactions_buyer_id_fkey (
                  *
                ),
                seller:profiles!transactions_seller_id_fkey (
                  *
                )
              `)
              .eq("id", transactionId)
              .maybeSingle();

            if (refetchError) throw refetchError;
            setTransaction(newTxnData);
          } else {
            throw new Error("Transaction non trouvée sur la blockchain");
          }
        } else {
          setTransaction(txnData);
        }

      } catch (error: any) {
        console.error("Error in fetchTransaction:", error);
        toast({
          title: "Erreur",
          description: error.message || "Une erreur est survenue lors du chargement des données",
          variant: "destructive",
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchTransaction();
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
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        transaction.smart_contract_address,
        ESCROW_ABI,
        signer
      );

      console.log("Releasing funds for transaction:", transaction.blockchain_txn_id);
      const tx = await contract.releaseFunds(transaction.blockchain_txn_id);
      console.log("Transaction sent:", tx.hash);

      const receipt = await tx.wait();
      console.log("Transaction receipt:", receipt);

      if (receipt.status === 1) {
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            status: 'completed',
            escrow_status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', transactionId);

        if (updateError) throw updateError;

        toast({
          title: "Succès",
          description: "Les fonds ont été libérés avec succès.",
        });
      } else {
        throw new Error("La transaction a échoué sur la blockchain");
      }
    } catch (error: any) {
      console.error('Error releasing funds:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <Card>
        <CardContent className="p-8">
          <p className="text-center text-muted-foreground">
            Transaction introuvable
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Détails de la transaction</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="font-medium">Article</h3>
          <p className="text-sm text-muted-foreground">
            {transaction?.listings?.title || "N/A"}
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Montant</h3>
          <p className="text-sm text-muted-foreground">
            {transaction?.amount} {transaction?.token_symbol}
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">État</h3>
          <p className="text-sm text-muted-foreground">
            {transaction?.escrow_status === 'pending' ? 'En attente' : 
             transaction?.escrow_status === 'completed' ? 'Terminée' : 
             'En cours'}
          </p>
        </div>

        {transaction?.escrow_status !== 'completed' && (
          <Button
            onClick={handleReleaseFunds}
            disabled={isLoading}
            className="w-full bg-purple-500 hover:bg-purple-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Libération des fonds en cours...
              </>
            ) : (
              "Confirmer la réception"
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
