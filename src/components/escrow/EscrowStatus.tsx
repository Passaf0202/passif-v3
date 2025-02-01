import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, Check, Loader2, Lock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ethers } from "ethers";

interface EscrowStatusProps {
  transactionId: string;
  buyerId: string;
  sellerId: string;
  currentUserId: string;
}

const ESCROW_ABI = [
  "function confirmTransaction(uint256 txnId)",
  "function getTransaction(uint256 txnId) view returns (address buyer, address seller, uint256 amount, bool buyerConfirmed, bool sellerConfirmed, bool fundsReleased)",
  "event TransactionCreated(uint256 indexed txnId, address buyer, address seller, uint256 amount)"
];

export function EscrowStatus({ transactionId, buyerId, sellerId, currentUserId }: EscrowStatusProps) {
  const [status, setStatus] = useState<string>("pending");
  const [isLoading, setIsLoading] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [fundsSecured, setFundsSecured] = useState(false);
  const [blockchainTxId, setBlockchainTxId] = useState<number | null>(null);
  const { toast } = useToast();

  const isUserBuyer = currentUserId === buyerId;
  const contractAddress = "0xe35a0cebf608bff98bcf99093b02469eea2cb38c";

  const getLastTransactionId = async (provider: ethers.providers.Web3Provider, transactionHash: string) => {
    try {
      console.log("Getting transaction receipt for hash:", transactionHash);
      const receipt = await provider.getTransactionReceipt(transactionHash);
      
      if (!receipt) {
        console.error("No receipt found for transaction");
        return null;
      }

      console.log("Transaction receipt:", receipt);
      const contractInterface = new ethers.utils.Interface(ESCROW_ABI);
      
      for (const log of receipt.logs) {
        try {
          const parsedLog = contractInterface.parseLog(log);
          if (parsedLog && parsedLog.name === 'TransactionCreated') {
            const txId = parsedLog.args.txnId.toNumber();
            console.log("Found TransactionCreated event with txId:", txId);
            return txId;
          }
        } catch (e) {
          console.log("Error parsing log:", e);
          continue;
        }
      }

      // Si on n'a pas trouvé l'événement, essayons de récupérer via le filtre
      const contract = new ethers.Contract(contractAddress, ESCROW_ABI, provider);
      const filter = contract.filters.TransactionCreated();
      const events = await contract.queryFilter(filter, receipt.blockNumber - 1, receipt.blockNumber);
      
      if (events.length > 0) {
        const txId = events[0].args.txnId.toNumber();
        console.log("Found TransactionCreated event via filter with txId:", txId);
        return txId;
      }

      return null;
    } catch (error) {
      console.error("Error getting last transaction ID:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchTransactionStatus = async () => {
      console.log("Fetching transaction status for ID:", transactionId);
      const { data, error } = await supabase
        .from("transactions")
        .select("escrow_status, buyer_confirmation, seller_confirmation, funds_secured, transaction_hash")
        .eq("id", transactionId)
        .single();

      if (error) {
        console.error("Error fetching transaction status:", error);
        return;
      }

      console.log("Transaction data:", data);
      setStatus(data.escrow_status);
      setHasConfirmed(isUserBuyer ? data.buyer_confirmation : data.seller_confirmation);
      setFundsSecured(data.funds_secured);

      if (data.transaction_hash) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const txId = await getLastTransactionId(provider, data.transaction_hash);
          
          if (txId !== null) {
            console.log("Setting blockchain txId:", txId);
            setBlockchainTxId(txId);
          }
        } catch (error) {
          console.error("Error processing transaction receipt:", error);
        }
      }
    };

    fetchTransactionStatus();

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
          setStatus(payload.new.escrow_status);
          setHasConfirmed(
            isUserBuyer
              ? payload.new.buyer_confirmation
              : payload.new.seller_confirmation
          );
          setFundsSecured(payload.new.funds_secured);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [transactionId, isUserBuyer]);

  const handleConfirmation = async () => {
    try {
      setIsLoading(true);

      if (blockchainTxId === null) {
        console.error("No blockchain transaction ID found");
        throw new Error("ID de transaction blockchain non trouvé");
      }

      console.log("Starting confirmation with txId:", blockchainTxId);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, ESCROW_ABI, signer);

      console.log("Calling confirmTransaction with numeric ID:", blockchainTxId);
      const tx = await contract.confirmTransaction(blockchainTxId);
      console.log("Confirmation transaction sent:", tx.hash);

      const receipt = await tx.wait();
      console.log("Confirmation transaction receipt:", receipt);

      if (receipt.status === 1) {
        const { error } = await supabase.functions.invoke('release-escrow', {
          body: {
            transactionId,
            action: "confirm",
            userId: currentUserId,
          },
        });

        if (error) throw error;

        toast({
          title: "Confirmation envoyée",
          description: "Votre confirmation a été enregistrée avec succès",
        });

        setHasConfirmed(true);
      }
    } catch (error) {
      console.error("Error confirming transaction:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de confirmer la transaction",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "completed") {
    return (
      <Alert className="bg-green-50 border-green-200">
        <Check className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-700">
          Transaction complétée avec succès
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Cette transaction est sécurisée par notre système d'escrow. Les fonds
          seront libérés une fois que l'acheteur aura confirmé la
          transaction.
        </AlertDescription>
      </Alert>

      {!fundsSecured && !isUserBuyer && (
        <Alert variant="destructive">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            En attente de la sécurisation des fonds par l'acheteur
          </AlertDescription>
        </Alert>
      )}

      {status === "pending" && !hasConfirmed && isUserBuyer && (
        <Button
          onClick={handleConfirmation}
          disabled={isLoading || (!isUserBuyer && !fundsSecured)}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Confirmation en cours...
            </>
          ) : (
            "Confirmer la réception"
          )}
        </Button>
      )}

      {status === "pending" && hasConfirmed && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            En attente de la confirmation de{" "}
            {isUserBuyer ? "livraison par le vendeur" : "réception par l'acheteur"}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
