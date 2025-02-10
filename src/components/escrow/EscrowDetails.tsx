
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { amoy } from "@/config/chains";
import { Loader2 } from "lucide-react";
import { useEscrowDetailsTransaction } from "./hooks/useEscrowDetailsTransaction";
import { TransactionStatus } from "./TransactionStatus";
import { ESCROW_CONTRACT_ADDRESS, ESCROW_ABI } from "./types/escrow";
import { ethers } from "ethers";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface EscrowDetailsProps {
  transactionId: string;
}

export function EscrowDetails({ transactionId }: EscrowDetailsProps) {
  const { transaction, isLoading, setIsLoading, isFetching, fetchTransaction } = 
    useEscrowDetailsTransaction(transactionId);
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { toast } = useToast();

  useEffect(() => {
    fetchTransaction();
  }, [transactionId]);

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
        ESCROW_CONTRACT_ADDRESS,
        ESCROW_ABI,
        signer
      );

      console.log("Releasing funds for transaction:", transaction?.blockchain_txn_id);
      const tx = await contract.releaseFunds(transaction?.blockchain_txn_id);
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

        fetchTransaction();
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

        <TransactionStatus transaction={transaction} />

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
