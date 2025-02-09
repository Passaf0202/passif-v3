
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
import { Alert, AlertDescription } from "@/components/ui/alert";

const ESCROW_ABI = [
  "function releaseFunds(uint256 txnId)",
  "function transactions(uint256) view returns (address buyer, address seller, uint256 amount, bool isFunded, bool isCompleted)",
  "function transactionCount() view returns (uint256)"
];

const ESCROW_CONTRACT_ADDRESS = "0xe35a0cebf608bff98bcf99093b02469eea2cb38c";

interface EscrowDetailsProps {
  transactionId: string;
}

export function EscrowDetails({ transactionId }: EscrowDetailsProps) {
  const [transaction, setTransaction] = useState<any>(null);
  const [isAlreadyConfirmed, setIsAlreadyConfirmed] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  useEffect(() => {
    const fetchTransaction = async () => {
      console.log('Fetching transaction with ID:', transactionId);
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          listings(*),
          buyer_confirmation,
          seller_wallet_address,
          blockchain_txn_id
        `)
        .eq("id", transactionId)
        .single();

      if (error) {
        console.error("Error fetching transaction:", error);
        return;
      }

      console.log("Transaction data:", data);
      setTransaction(data);
      setIsAlreadyConfirmed(data.buyer_confirmation);
    };

    fetchTransaction();

    // Subscribe to changes
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
          setTransaction(payload.new);
          setIsAlreadyConfirmed(payload.new.buyer_confirmation);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [transactionId]);

  const handleReleaseFunds = async () => {
    if (!transaction?.blockchain_txn_id) {
      toast({
        title: "Erreur",
        description: "ID de transaction blockchain manquant",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsReleasing(true);

      if (chain?.id !== amoy.id) {
        if (!switchNetwork) {
          throw new Error("Impossible de changer de réseau automatiquement");
        }
        await switchNetwork(amoy.id);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      const contract = new ethers.Contract(
        ESCROW_CONTRACT_ADDRESS,
        ESCROW_ABI,
        signer
      );

      // Convertir l'ID de transaction en nombre
      const txnId = Number(transaction.blockchain_txn_id);
      if (isNaN(txnId)) {
        throw new Error("ID de transaction blockchain invalide");
      }

      console.log('Releasing funds for blockchain transaction:', txnId);
      const tx = await contract.releaseFunds(txnId);
      console.log('Release funds transaction sent:', tx.hash);

      const receipt = await tx.wait();
      console.log('Release funds receipt:', receipt);

      if (receipt.status === 1) {
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            status: 'completed',
            escrow_status: 'completed',
            released_at: new Date().toISOString(),
            buyer_confirmation: true
          })
          .eq('id', transactionId);

        if (updateError) throw updateError;

        toast({
          title: "Fonds libérés avec succès",
          description: "Les fonds ont été envoyés au vendeur.",
        });
      } else {
        throw new Error("La transaction a échoué sur la blockchain");
      }
    } catch (error: any) {
      console.error('Error releasing funds:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la libération des fonds",
        variant: "destructive",
      });
    } finally {
      setIsReleasing(false);
    }
  };

  if (!transaction || !user) return null;

  const isBuyer = user.id === transaction.buyer_id;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Détails de la transaction</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="font-medium">Article</h3>
          <p className="text-sm text-muted-foreground">
            {transaction.listings?.title || "Titre non disponible"}
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Montant</h3>
          <p className="text-sm text-muted-foreground">
            {transaction.amount} {transaction.token_symbol}
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Adresse du vendeur</h3>
          <p className="text-sm text-muted-foreground">
            {transaction.seller_wallet_address || "Adresse non disponible"}
          </p>
        </div>

        {isBuyer && !isAlreadyConfirmed && (
          <>
            <Alert>
              <AlertDescription>
                Une fois que vous aurez reçu l'article, cliquez sur le bouton ci-dessous pour libérer les fonds au vendeur.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleReleaseFunds}
              disabled={isReleasing}
              className="w-full"
            >
              {isReleasing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Libération des fonds en cours...
                </>
              ) : (
                "Confirmer la réception et libérer les fonds"
              )}
            </Button>
          </>
        )}

        {isAlreadyConfirmed && (
          <Alert>
            <AlertDescription>
              Les fonds ont été libérés au vendeur.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
