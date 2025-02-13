
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

const MIN_WAIT_TIME_MS = 30000; // 30 secondes minimum après la sécurisation des fonds
const MAX_RETRIES = 3;
const GAS_INCREASE_FACTOR = 1.5; // +50% de gas
const REQUIRED_CONFIRMATIONS = 2;

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

  const verifyBlockchainState = async (provider: ethers.providers.Web3Provider, contract: ethers.Contract, txnId: number) => {
    // 1. Vérifier la synchronisation du nœud
    const currentBlock = await provider.getBlockNumber();
    const latestBlock = await provider.getBlock('latest');
    
    if (Math.abs(currentBlock - latestBlock.number) > 5) {
      throw new Error("Le nœud n'est pas complètement synchronisé. Veuillez réessayer dans quelques instants.");
    }

    // 2. Vérifier l'état de la transaction
    console.log("Verifying blockchain state for transaction:", txnId);
    const [buyer, seller, amount, isFunded, isCompleted] = await contract.transactions(txnId);

    console.log("Blockchain state:", {
      buyer,
      seller,
      amount: ethers.utils.formatEther(amount),
      isFunded,
      isCompleted
    });

    // 3. Vérifications approfondies
    if (!isFunded) {
      throw new Error("Les fonds n'ont pas été déposés sur la blockchain");
    }

    if (isCompleted) {
      throw new Error("Les fonds ont déjà été libérés");
    }

    // Mise à jour de la vérification de l'adresse du vendeur
    const { data: storedTransaction, error } = await supabase
      .from('transactions')
      .select('seller_wallet_address')
      .eq('id', transactionId)
      .single();

    if (error) {
      console.error("Error fetching seller address:", error);
      throw new Error("Erreur lors de la vérification de l'adresse du vendeur");
    }

    console.log("Comparing addresses:", {
      blockchain: seller.toLowerCase(),
      database: storedTransaction.seller_wallet_address?.toLowerCase(),
      fromTransaction: transaction.seller_wallet_address?.toLowerCase()
    });

    // Vérifier si l'une des adresses correspond
    if (seller.toLowerCase() !== storedTransaction.seller_wallet_address?.toLowerCase() && 
        seller.toLowerCase() !== transaction.seller_wallet_address?.toLowerCase()) {
      throw new Error("Incohérence d'adresse vendeur. Contactez le support.");
    }

    return { buyer, seller, amount, isFunded, isCompleted };
  };

  const verifyTimingAndPermissions = async (signerAddress: string, buyer: string) => {
    // 1. Vérifier le délai minimum
    if (transaction.funds_secured_at) {
      const securedTime = new Date(transaction.funds_secured_at).getTime();
      const currentTime = Date.now();
      const timeDiff = currentTime - securedTime;

      if (timeDiff < MIN_WAIT_TIME_MS) {
        const remainingSeconds = Math.ceil((MIN_WAIT_TIME_MS - timeDiff) / 1000);
        throw new Error(`Veuillez attendre encore ${remainingSeconds} secondes avant de libérer les fonds`);
      }
    }

    // 2. Vérifier les permissions
    if (buyer.toLowerCase() !== signerAddress.toLowerCase()) {
      throw new Error("Seul l'acheteur peut libérer les fonds");
    }
  };

  const estimateGasWithRetry = async (
    contract: ethers.Contract,
    txnId: number,
    retryCount: number = 0
  ): Promise<{ gasLimit: ethers.BigNumber; maxFeePerGas: ethers.BigNumber }> => {
    try {
      const gasLimit = await contract.estimateGas.releaseFunds(txnId);
      const feeData = await contract.provider.getFeeData();
      
      // Calcul du gas avec une marge progressive selon le nombre de retries
      const increaseFactor = Math.pow(GAS_INCREASE_FACTOR, retryCount + 1);
      const adjustedGasLimit = gasLimit.mul(Math.floor(increaseFactor * 100)).div(100);
      
      const maxFeePerGas = feeData.maxFeePerGas
        ? feeData.maxFeePerGas.mul(Math.floor(increaseFactor * 100)).div(100)
        : ethers.utils.parseUnits("50", "gwei"); // Fallback

      return { gasLimit: adjustedGasLimit, maxFeePerGas };
    } catch (error) {
      console.error("Gas estimation error:", error);
      throw new Error("Impossible d'estimer les frais de transaction");
    }
  };

  const handleConfirmTransaction = async () => {
    let retryCount = 0;

    const attemptRelease = async (): Promise<void> => {
      try {
        if (!user?.id) throw new Error("Utilisateur non connecté");
        if (!transaction.funds_secured) throw new Error("Les fonds ne sont pas sécurisés");
        if (!transaction.blockchain_txn_id) throw new Error("ID de transaction blockchain manquant");

        // 1. Vérifier et changer de réseau si nécessaire
        if (chain?.id !== amoy.id) {
          if (!switchNetwork) throw new Error("Impossible de changer de réseau");
          await switchNetwork(amoy.id);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        if (!window.ethereum) throw new Error("MetaMask n'est pas installé");

        // 2. Initialiser le provider et le contrat
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const signerAddress = await signer.getAddress();
        const contract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, signer);

        // 3. Vérifier l'état de la blockchain
        const txnId = Number(transaction.blockchain_txn_id);
        const blockchainState = await verifyBlockchainState(provider, contract, txnId);

        // 4. Vérifier le timing et les permissions
        await verifyTimingAndPermissions(signerAddress, blockchainState.buyer);

        // 5. Estimer le gas avec la marge actuelle
        const { gasLimit, maxFeePerGas } = await estimateGasWithRetry(contract, txnId, retryCount);

        // 6. Vérifier le solde pour le gas
        const balance = await provider.getBalance(signerAddress);
        const estimatedCost = gasLimit.mul(maxFeePerGas);
        if (balance.lt(estimatedCost)) {
          throw new Error("Solde insuffisant pour couvrir les frais de transaction");
        }

        // 7. Envoyer la transaction
        console.log("Sending transaction with params:", {
          gasLimit: gasLimit.toString(),
          maxFeePerGas: maxFeePerGas.toString()
        });

        const tx = await contract.releaseFunds(txnId, {
          gasLimit,
          maxFeePerGas
        });

        console.log("Transaction sent:", tx.hash);

        // 8. Attendre les confirmations requises
        const receipt = await tx.wait(REQUIRED_CONFIRMATIONS);
        console.log("Transaction confirmed:", receipt);

        if (receipt.status === 1) {
          // 9. Mettre à jour la base de données
          const { error: updateError } = await supabase
            .from('transactions')
            .update({
              updated_at: new Date().toISOString(),
              status: 'completed',
              escrow_status: 'completed',
              buyer_confirmation: true,
              seller_confirmation: true
            })
            .eq('id', transactionId);

          if (updateError) throw updateError;

          toast({
            title: "Succès",
            description: "Les fonds ont été libérés avec succès",
          });

          onRelease();
        } else {
          throw new Error("La transaction a échoué sur la blockchain");
        }
      } catch (error: any) {
        console.error('Release error:', error);

        // Gérer les différents types d'erreurs
        if (error.code === 'UNPREDICTABLE_GAS_LIMIT' || 
            error.message.includes('Internal JSON-RPC error')) {
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            console.log(`Retrying transaction (${retryCount}/${MAX_RETRIES})...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            return attemptRelease();
          }
        }

        let errorMessage = "Une erreur est survenue lors de la libération des fonds";
        
        if (error.message.includes('user rejected')) {
          errorMessage = "Vous avez annulé la transaction";
        } else if (error.message.includes("Internal JSON-RPC error")) {
          errorMessage = "Erreur de communication avec la blockchain. Veuillez réessayer.";
        } else {
          errorMessage = error.message;
        }

        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive",
        });

        throw error;
      }
    };

    try {
      setIsLoading(true);
      await attemptRelease();
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
