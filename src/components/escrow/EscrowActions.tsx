
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useNetwork, useSwitchNetwork, useAccount } from "wagmi";
import { amoy } from "@/config/chains";
import { ethers } from "ethers";
import { ESCROW_CONTRACT_ADDRESS, ESCROW_ABI } from "./types/escrow";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Transaction } from "./types/escrow";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileWalletRedirect } from "../payment/MobileWalletRedirect";

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
  const isMobile = useIsMobile();
  const { connector, isConnected } = useAccount();

  const canConfirmTransaction = transaction.funds_secured && 
    !transaction.buyer_confirmation && 
    (user?.id === transaction.buyer?.id || user?.id === transaction.seller?.id);

  const initializeProvider = async () => {
    try {
      let provider;
      
      if (typeof window !== 'undefined' && window.ethereum) {
        console.log("[EscrowActions] Using window.ethereum provider");
        provider = new ethers.providers.Web3Provider(window.ethereum);
      } else if (isConnected && connector) {
        console.log("[EscrowActions] Using WalletConnect provider");
        const connectorProvider = await connector.getProvider();
        await new Promise(resolve => setTimeout(resolve, 1000));
        provider = new ethers.providers.Web3Provider(connectorProvider);
      }

      if (!provider) {
        throw new Error("Impossible d'initialiser le provider");
      }

      return provider;
    } catch (error) {
      console.error("[EscrowActions] Provider initialization error:", error);
      throw new Error("Erreur lors de l'initialisation du wallet");
    }
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

      // Vérification plus stricte de l'adresse du vendeur
      if (!transaction.seller_wallet_address) {
        throw new Error("Adresse du vendeur manquante");
      }

      console.log("[EscrowActions] Transaction wallet addresses:", {
        sellerWalletAddress: transaction.seller_wallet_address,
        transactionSellerId: transaction.seller?.id,
        userId: user.id,
        buyerId: transaction.buyer?.id
      });

      if (chain?.id !== amoy.id) {
        if (!switchNetwork) {
          throw new Error("Impossible de changer de réseau automatiquement");
        }
        console.log("[EscrowActions] Switching network to Amoy...");
        await switchNetwork(amoy.id);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log("[EscrowActions] Initializing provider...");
      const provider = await initializeProvider();
      const signer = provider.getSigner();
      
      console.log("[EscrowActions] Getting signer address...");
      const signerAddress = await signer.getAddress();
      console.log("[EscrowActions] Connected with address:", signerAddress);

      const contract = new ethers.Contract(
        ESCROW_CONTRACT_ADDRESS,
        ESCROW_ABI,
        signer
      );

      // 6. Estimer le gaz
      console.log("[EscrowActions] Estimating gas for confirmTransaction...");
      const gasEstimate = await contract.estimateGas.confirmTransaction();
      const gasLimit = gasEstimate.mul(120).div(100); // +20% marge

      // 7. Envoyer la transaction
      console.log("[EscrowActions] Sending confirmation transaction...");
      const tx = await contract.confirmTransaction({ gasLimit });
      console.log("[EscrowActions] Transaction sent:", tx.hash);
      
      const receipt = await tx.wait();
      console.log("[EscrowActions] Transaction receipt:", receipt);

      if (receipt.status === 1) {
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            buyer_confirmation: true,
            seller_confirmation: true,
            status: 'completed',
            escrow_status: 'completed',
            updated_at: new Date().toISOString()
          })
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
      console.error('[EscrowActions] Error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (transaction?.escrow_status === 'completed') {
    return null;
  }

  if (isMobile) {
    return (
      <MobileWalletRedirect 
        isProcessing={isLoading}
        onConfirm={handleConfirmTransaction}
        action="release"
      />
    );
  }

  return (
    <Button
      onClick={handleConfirmTransaction}
      disabled={isLoading || !canConfirmTransaction}
      className="w-full bg-black hover:bg-black/90"
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
