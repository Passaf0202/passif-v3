
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ethers } from "ethers";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { amoy } from "@/config/chains";
import { Loader2 } from "lucide-react";

const ESCROW_ABI = [
  "function releaseFunds(uint256 txnId)",
  "function transactions(uint256) view returns (address buyer, address seller, uint256 amount, bool isFunded, bool isCompleted)",
  "function transactionCount() view returns (uint256)"
];

const ESCROW_CONTRACT_ADDRESS = "0xe35a0cebf608bff98bcf99093b02469eea2cb38c";

interface EscrowStatusProps {
  transactionId: string;
  buyerId: string;
  sellerId: string;
  currentUserId: string;
}

export function EscrowStatus({
  transactionId,
  buyerId,
  sellerId,
  currentUserId,
}: EscrowStatusProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFundsSecured, setIsFundsSecured] = useState(false);
  const [isTransactionComplete, setIsTransactionComplete] = useState(false);
  const { toast } = useToast();
  const isUserBuyer = currentUserId === buyerId;
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  useEffect(() => {
    const checkTransactionStatus = async () => {
      console.log('Checking transaction status for ID:', transactionId);
      
      const { data: transaction, error } = await supabase
        .from('transactions')
        .select('funds_secured, blockchain_txn_id, transaction_hash, status')
        .eq('id', transactionId)
        .single();

      if (error) {
        console.error('Error fetching transaction:', error);
        return;
      }

      console.log('Transaction status:', transaction);
      setIsFundsSecured(transaction.funds_secured);
      setIsTransactionComplete(transaction.status === 'completed');
    };

    checkTransactionStatus();

    // Subscribe to transaction updates
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
          console.log('Transaction updated:', payload);
          setIsFundsSecured(payload.new.funds_secured);
          setIsTransactionComplete(payload.new.status === 'completed');
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [transactionId]);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      console.log('Starting confirmation process...');

      // Vérifier que l'utilisateur est sur le bon réseau
      if (chain?.id !== amoy.id) {
        if (!switchNetwork) {
          throw new Error("Impossible de changer de réseau automatiquement");
        }
        await switchNetwork(amoy.id);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Se connecter au wallet
      if (!window.ethereum) {
        throw new Error("MetaMask n'est pas installé");
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const signerAddress = await signer.getAddress();

      console.log('Connected wallet address:', signerAddress);

      // Récupérer les détails de la transaction depuis Supabase
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (txError || !transaction) {
        console.error('Error fetching transaction:', txError);
        throw new Error("Transaction non trouvée");
      }

      console.log('Transaction from database:', transaction);

      // Vérifier que l'utilisateur est l'acheteur
      if (!isUserBuyer) {
        throw new Error("Seul l'acheteur peut libérer les fonds");
      }

      // Vérifier que l'adresse connectée correspond à celle de l'acheteur
      const contract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, signer);
      const txnId = Number(transaction.blockchain_txn_id);
      const txData = await contract.transactions(txnId);

      console.log('Transaction data from blockchain:', txData);

      if (txData.buyer.toLowerCase() !== signerAddress.toLowerCase()) {
        throw new Error("L'adresse de votre wallet ne correspond pas à celle utilisée pour la transaction");
      }

      if (!txData.isFunded) {
        throw new Error("Les fonds n'ont pas été déposés pour cette transaction");
      }

      if (txData.isCompleted) {
        throw new Error("Les fonds ont déjà été libérés");
      }

      // Estimer le gas
      const gasEstimate = await contract.estimateGas.releaseFunds(txnId);
      const gasLimit = gasEstimate.mul(150).div(100); // +50% marge
      const gasPrice = await provider.getGasPrice();
      const adjustedGasPrice = gasPrice.mul(120).div(100); // +20% sur le prix du gas

      console.log('Gas estimation:', {
        gasEstimate: gasEstimate.toString(),
        gasLimit: gasLimit.toString(),
        gasPrice: gasPrice.toString(),
        adjustedGasPrice: adjustedGasPrice.toString()
      });

      // Vérifier le solde pour couvrir les frais de gas
      const balance = await provider.getBalance(signerAddress);
      const gasCost = gasLimit.mul(adjustedGasPrice);
      if (balance.lt(gasCost)) {
        throw new Error("Solde insuffisant pour couvrir les frais de transaction");
      }

      // Envoyer la transaction
      const tx = await contract.releaseFunds(txnId, {
        gasLimit,
        gasPrice: adjustedGasPrice
      });

      console.log('Release funds transaction sent:', tx.hash);

      // Attendre la confirmation
      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);

      if (receipt.status === 1) {
        // Mettre à jour la base de données
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            buyer_confirmation: true,
            status: 'completed',
            escrow_status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', transactionId);

        if (updateError) throw updateError;

        toast({
          title: "Succès",
          description: "Les fonds ont été libérés au vendeur avec succès.",
        });
      } else {
        throw new Error("La libération des fonds a échoué");
      }
    } catch (error: any) {
      console.error('Error releasing funds:', error);
      
      let errorMessage = "Une erreur est survenue lors de la libération des fonds";
      
      if (error.message.includes("encore été sécurisés")) {
        errorMessage = "Les fonds n'ont pas encore été sécurisés sur la blockchain. Veuillez patienter quelques minutes et réessayer.";
      } else if (error.message.includes("user rejected")) {
        errorMessage = "Vous avez rejeté la transaction";
      } else if (error.message.includes("insufficient funds")) {
        errorMessage = "Solde insuffisant pour payer les frais de transaction";
      } else if (error.code === "UNPREDICTABLE_GAS_LIMIT") {
        errorMessage = "Erreur d'estimation du gas. La transaction n'est peut-être pas valide.";
      } else {
        errorMessage = error.message;
      }

      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isTransactionComplete) {
    return (
      <Alert>
        <AlertDescription>
          La transaction a été complétée avec succès. Les fonds ont été libérés au vendeur.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Alert variant={isFundsSecured ? "default" : "destructive"}>
        <AlertDescription>
          {isUserBuyer ? (
            isFundsSecured ? (
              "En tant qu'acheteur, vous pouvez confirmer la réception de l'article pour libérer les fonds."
            ) : (
              "Veuillez patienter que les fonds soient sécurisés sur la blockchain avant de pouvoir les libérer."
            )
          ) : (
            "En tant que vendeur, vous recevrez les fonds une fois que l'acheteur aura confirmé la réception."
          )}
        </AlertDescription>
      </Alert>

      {isUserBuyer && (
        <Button
          onClick={handleConfirm}
          disabled={isLoading || !isFundsSecured}
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
    </div>
  );
}
