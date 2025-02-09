
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ethers } from "ethers";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { amoy } from "@/config/chains";

const ESCROW_ABI = [
  "function releaseFunds(uint256 txnId)",
  "function transactions(uint256) view returns (address buyer, address seller, uint256 amount, bool isFunded, bool isCompleted)",
  "function transactionCount() view returns (uint256)"
];

const ESCROW_CONTRACT_ADDRESS = "0xe35a0cebf608bff98bcf99093b02469eea2cb38c";

export function useFundsRelease(transactionId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  const handleReleaseFunds = async () => {
    try {
      setIsLoading(true);
      console.log('Starting funds release process...');

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
      const signerAddress = await signer.getAddress();

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

      const gasEstimate = await contract.estimateGas.releaseFunds(txnId);
      const gasLimit = gasEstimate.mul(150).div(100);
      const gasPrice = await provider.getGasPrice();
      const adjustedGasPrice = gasPrice.mul(120).div(100);

      console.log('Gas estimation:', {
        estimate: gasEstimate.toString(),
        limit: gasLimit.toString(),
        price: gasPrice.toString(),
        adjustedPrice: adjustedGasPrice.toString()
      });

      const balance = await provider.getBalance(signerAddress);
      const gasCost = gasLimit.mul(adjustedGasPrice);
      if (balance.lt(gasCost)) {
        throw new Error("Solde insuffisant pour couvrir les frais de transaction");
      }

      const tx = await contract.releaseFunds(txnId, {
        gasLimit,
        gasPrice: adjustedGasPrice
      });

      console.log('Release funds transaction sent:', tx.hash);

      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);

      if (receipt.status === 1) {
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            status: 'completed',
            escrow_status: 'completed',
            released_at: new Date().toISOString(),
            transaction_confirmed_at: new Date().toISOString()
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
      
      if (error.message.includes("user rejected")) {
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

  return {
    isLoading,
    handleReleaseFunds
  };
}
