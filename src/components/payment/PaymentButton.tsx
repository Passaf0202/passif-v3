
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useNetwork, useSwitchNetwork } from 'wagmi';
import { amoy } from '@/config/chains';
import { useToast } from "@/components/ui/use-toast";
import { ethers } from 'ethers';
import { supabase } from "@/integrations/supabase/client";

interface PaymentButtonProps {
  isProcessing: boolean;
  isConnected: boolean;
  cryptoAmount?: number;
  cryptoCurrency?: string;
  onClick: () => void;
  disabled?: boolean;
  sellerAddress?: string;
  transactionId?: string;
}

const ESCROW_ABI = [
  "function createTransaction(address seller) payable returns (uint256)",
  "function confirmTransaction(uint256 txnId)",
  "function getTransaction(uint256 txnId) view returns (address buyer, address seller, uint256 amount, bool buyerConfirmed, bool sellerConfirmed, bool fundsReleased)",
  "event TransactionCreated(uint256 indexed txnId, address buyer, address seller, uint256 amount)",
  "event FundsDeposited(uint256 txnId, address buyer, address seller, uint256 amount)"
];

export function PaymentButton({ 
  isProcessing, 
  isConnected, 
  cryptoAmount, 
  cryptoCurrency = 'BNB',
  onClick,
  disabled = false,
  sellerAddress,
  transactionId
}: PaymentButtonProps) {
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { toast } = useToast();

  const formatAmount = (amount: number): string => {
    return amount.toFixed(18).replace(/\.?0+$/, '');
  };

  const handleClick = async () => {
    if (!isConnected || !sellerAddress || !cryptoAmount) {
      toast({
        title: "Erreur",
        description: "Veuillez connecter votre wallet et vérifier les informations de paiement",
        variant: "destructive",
      });
      return;
    }

    try {
      if (chain?.id !== amoy.id) {
        if (!switchNetwork) {
          throw new Error("Impossible de changer de réseau automatiquement");
        }
        await switchNetwork(amoy.id);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log('Starting transaction with params:', {
        sellerAddress,
        amount: formatAmount(cryptoAmount)
      });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      const contractAddress = "0xe35a0cebf608bff98bcf99093b02469eea2cb38c";
      const contract = new ethers.Contract(contractAddress, ESCROW_ABI, signer);

      const formattedAmount = formatAmount(cryptoAmount);
      const amountInWei = ethers.utils.parseUnits(formattedAmount, 18);
      console.log('Amount in Wei:', amountInWei.toString());

      const estimatedGas = await contract.estimateGas.createTransaction(sellerAddress, {
        value: amountInWei
      });
      const gasLimit = estimatedGas.mul(150).div(100); // +50% margin

      console.log('Creating transaction with gasLimit:', gasLimit.toString());
      
      const tx = await contract.createTransaction(sellerAddress, {
        value: amountInWei,
        gasLimit: gasLimit
      });

      console.log('Transaction sent:', tx.hash);

      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);

      const fundsDepositedEvent = receipt.events?.find(e => e.event === 'FundsDeposited');
      if (!fundsDepositedEvent || !fundsDepositedEvent.args) {
        throw new Error("Impossible de récupérer l'ID de transaction");
      }

      const txnId = fundsDepositedEvent.args.txnId.toString();
      console.log('Transaction ID from event:', txnId);

      if (transactionId) {
        console.log('Storing transaction data:', {
          blockchain_txn_id: txnId,
          transaction_hash: tx.hash
        });

        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            blockchain_txn_id: Number(txnId),
            transaction_hash: tx.hash,
            funds_secured: true,
            funds_secured_at: new Date().toISOString()
          })
          .eq('id', transactionId);

        if (updateError) {
          console.error('Error updating transaction:', updateError);
          throw updateError;
        }
      }

      toast({
        title: "Transaction réussie",
        description: "Les fonds ont été bloqués dans le contrat d'escrow",
      });
      onClick();

    } catch (error: any) {
      console.error('Transaction error:', error);
      toast({
        title: "Erreur de transaction",
        description: error.message || "La transaction a échoué. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const wrongNetwork = chain?.id !== amoy.id;
  const buttonDisabled = isProcessing || !isConnected || !cryptoAmount || disabled || !sellerAddress;

  return (
    <div className="w-full space-y-2">
      <Button 
        onClick={handleClick} 
        disabled={buttonDisabled}
        className="w-full bg-primary hover:bg-primary/90"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Transaction en cours...
          </>
        ) : disabled ? (
          "Transaction en attente de confirmation..."
        ) : wrongNetwork ? (
          "Changer vers Polygon Amoy"
        ) : !isConnected ? (
          "Connecter votre wallet"
        ) : !sellerAddress ? (
          "Adresse du vendeur manquante"
        ) : (
          `Payer ${cryptoAmount?.toFixed(6)} ${cryptoCurrency}`
        )}
      </Button>

      {!isConnected && (
        <p className="text-sm text-red-500 text-center">
          Veuillez connecter votre portefeuille pour effectuer le paiement
        </p>
      )}

      {wrongNetwork && isConnected && (
        <p className="text-sm text-red-500 text-center">
          Veuillez vous connecter au réseau Polygon Amoy
        </p>
      )}
    </div>
  );
}
