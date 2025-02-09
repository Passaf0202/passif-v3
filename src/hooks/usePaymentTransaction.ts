
import { useState } from "react";
import { ethers } from "ethers";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEscrowContract } from "./escrow/useEscrowContract";
import { useTransactionUpdater } from "./escrow/useTransactionUpdater";
import { useNavigate } from "react-router-dom";
import { CONTRACT_ADDRESS, ESCROW_ABI } from "@/utils/escrow/contractUtils";

export const usePaymentTransaction = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<'none' | 'pending' | 'confirmed' | 'failed'>('none');
  const navigate = useNavigate();
  
  const { toast } = useToast();

  const handlePayment = async (
    sellerAddress: string,
    cryptoAmount: number,
    transactionId?: string
  ) => {
    if (!window.ethereum) {
      throw new Error("MetaMask n'est pas installé");
    }

    try {
      setIsProcessing(true);
      setError(null);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []); 
      
      const network = await provider.getNetwork();
      console.log('Connected to network:', network);

      if (network.chainId !== 80002) {
        throw new Error("Veuillez vous connecter au réseau Polygon Amoy");
      }

      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ESCROW_ABI, signer);
      
      const formattedAmount = cryptoAmount.toString();
      const amountInWei = ethers.utils.parseUnits(formattedAmount, 18);
      console.log('Amount in Wei:', amountInWei.toString());

      const signerAddress = await signer.getAddress();
      const balance = await provider.getBalance(signerAddress);
      
      if (balance.lt(amountInWei)) {
        throw new Error("Solde POL insuffisant pour effectuer la transaction");
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      try {
        const gasPrice = await provider.getGasPrice();
        const adjustedGasPrice = gasPrice.mul(120).div(100);
        console.log('Using gas price:', ethers.utils.formatUnits(adjustedGasPrice, 'gwei'), 'gwei');

        const tx = await contract.createTransaction(sellerAddress, {
          value: amountInWei,
          gasLimit: 300000,
          gasPrice: adjustedGasPrice
        });

        console.log('Transaction sent:', tx.hash);
        const receipt = await tx.wait();
        console.log('Transaction receipt:', receipt);

        if (!receipt.status) {
          throw new Error("La transaction a échoué sur la blockchain");
        }

        if (transactionId) {
          const { error: updateError } = await supabase
            .from('transactions')
            .update({
              transaction_hash: tx.hash,
              funds_secured: true,
              funds_secured_at: new Date().toISOString(),
              blockchain_txn_id: receipt.events?.[0]?.args?.[0]?.toString() || '0'
            })
            .eq('id', transactionId);

          if (updateError) {
            console.error('Error updating transaction:', updateError);
          } else {
            // Redirect to the transaction details page
            navigate(`/transaction/${transactionId}`);
          }
        }

        return tx.hash;

      } catch (txError: any) {
        console.error('Transaction failed:', txError);
        
        if (txError.code === 'INSUFFICIENT_FUNDS') {
          throw new Error("Solde POL insuffisant pour payer les frais de transaction");
        } else if (txError.code === 'UNPREDICTABLE_GAS_LIMIT') {
          throw new Error("Erreur lors de l'estimation des frais. Veuillez réessayer.");
        } else if (txError.code === 'NETWORK_ERROR') {
          throw new Error("Erreur de connexion au réseau. Veuillez vérifier votre connexion et réessayer.");
        } else if (txError.message?.includes('execution reverted')) {
          throw new Error("Le contrat a rejeté la transaction. Veuillez vérifier les paramètres.");
        }
        
        throw new Error("Une erreur est survenue lors de la transaction. Veuillez réessayer.");
      }

    } catch (error: any) {
      console.error('Error in createTransaction:', error);
      
      if (error.code === -32603) {
        throw new Error("Erreur de connexion au réseau. Veuillez rafraîchir la page et réessayer.");
      } else if (error.message.includes('user rejected')) {
        throw new Error("Transaction rejetée par l'utilisateur");
      }
      
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return { handlePayment, isProcessing, error, transactionStatus };
};
