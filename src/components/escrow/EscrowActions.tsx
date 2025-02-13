
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { amoy } from "@/config/chains";
import { ethers } from "ethers";
import { ESCROW_CONTRACT_ADDRESS, ESCROW_ABI } from "./types/escrow";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Transaction } from "./types/escrow";
import { useAuth } from "@/hooks/useAuth";

interface EscrowActionsProps {
  transaction: Transaction;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  onRelease: () => void;
  transactionId: string;
}

export function EscrowActions({ 
  transaction, 
  isLoading, 
  setIsLoading, 
  onRelease,
  transactionId 
}: EscrowActionsProps) {
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { toast } = useToast();
  const { user } = useAuth();

  const verifyBlockchainTransaction = async (contract: ethers.Contract, txnId: number) => {
    console.log("Verifying blockchain transaction:", txnId);

    const [buyer, seller, amount, isFunded, isCompleted] = await contract.transactions(txnId);

    console.log("Blockchain transaction details:", {
      buyer,
      seller,
      amount: ethers.utils.formatEther(amount),
      isFunded,
      isCompleted,
      expectedSellerAddress: transaction.seller_wallet_address
    });

    // Vérifier que l'adresse du vendeur correspond
    if (seller.toLowerCase() !== transaction.seller_wallet_address?.toLowerCase()) {
      throw new Error(
        "L'adresse du vendeur dans la blockchain ne correspond pas à celle de la transaction. " +
        "Veuillez contacter le support."
      );
    }

    // Vérifier que les fonds sont bien déposés
    if (!isFunded) {
      throw new Error("Les fonds n'ont pas encore été déposés sur la blockchain.");
    }

    // Vérifier que la transaction n'est pas déjà complétée
    if (isCompleted) {
      throw new Error("Les fonds ont déjà été libérés pour cette transaction.");
    }

    return { buyer, seller, amount, isFunded, isCompleted };
  };

  const handleConfirmTransaction = async () => {
    try {
      setIsLoading(true);

      if (!user?.id) {
        throw new Error("Utilisateur non connecté");
      }

      if (!transaction.funds_secured) {
        throw new Error("Les fonds ne sont pas encore sécurisés");
      }

      console.log("Transaction details:", {
        id: transactionId,
        blockchain_txn_id: transaction.blockchain_txn_id,
        user_id: user.id,
        buyer_id: transaction.buyer?.id,
        seller_id: transaction.seller?.id,
        funds_secured: transaction.funds_secured,
        buyer_confirmation: transaction.buyer_confirmation,
        seller_confirmation: transaction.seller_confirmation
      });

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
      const signerAddress = await signer.getAddress();
      console.log("Connected with address:", signerAddress);

      const contract = new ethers.Contract(
        ESCROW_CONTRACT_ADDRESS,
        ESCROW_ABI,
        signer
      );

      if (!transaction.blockchain_txn_id) {
        throw new Error("ID de transaction blockchain manquant");
      }

      const txnId = Number(transaction.blockchain_txn_id);
      console.log("Using blockchain transaction ID:", txnId);

      // Vérifier la transaction sur la blockchain
      const blockchainTxn = await verifyBlockchainTransaction(contract, txnId);
      console.log("Blockchain transaction verified:", blockchainTxn);

      // Vérifier que l'utilisateur est bien l'acheteur
      if (blockchainTxn.buyer.toLowerCase() !== signerAddress.toLowerCase()) {
        throw new Error("Seul l'acheteur peut libérer les fonds");
      }

      // Envoyer la transaction de libération des fonds
      console.log("Releasing funds for transaction ID:", txnId);
      const tx = await contract.releaseFunds(txnId);
      console.log("Release funds transaction sent:", tx.hash);

      const receipt = await tx.wait();
      console.log("Release funds transaction receipt:", receipt);

      if (receipt.status === 1) {
        const updates: any = {
          updated_at: new Date().toISOString(),
          status: 'completed',
          escrow_status: 'completed',
          buyer_confirmation: true,
          seller_confirmation: true
        };

        const { error: updateError } = await supabase
          .from('transactions')
          .update(updates)
          .eq('id', transactionId);

        if (updateError) throw updateError;

        toast({
          title: "Succès",
          description: "Les fonds ont été libérés avec succès",
        });

        onRelease();
      } else {
        throw new Error("La libération des fonds a échoué sur la blockchain");
      }
    } catch (error: any) {
      console.error('Error releasing funds:', error);
      
      // Améliorer le message d'erreur pour l'utilisateur
      let errorMessage = "Une erreur est survenue lors de la libération des fonds";
      
      if (error.message.includes("Internal JSON-RPC error")) {
        errorMessage = "Erreur de communication avec la blockchain. Vérifiez que votre wallet est bien connecté et que vous êtes sur le bon réseau.";
      } else if (error.message.includes("user rejected")) {
        errorMessage = "Vous avez annulé la transaction";
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

  const canConfirmTransaction = transaction.funds_secured && 
    !transaction.buyer_confirmation && 
    (user?.id === transaction.buyer?.id || user?.id === transaction.seller?.id);

  if (transaction?.escrow_status === 'completed') {
    return null;
  }

  return (
    <Button
      onClick={handleConfirmTransaction}
      disabled={isLoading || !canConfirmTransaction}
      className="w-full bg-purple-500 hover:bg-purple-600"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Libération des fonds en cours...
        </>
      ) : canConfirmTransaction ? (
        "Libérer les fonds au vendeur"
      ) : (
        "En attente de confirmation"
      )}
    </Button>
  );
}
