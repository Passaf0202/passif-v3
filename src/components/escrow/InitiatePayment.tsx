
import { Button } from "@/components/ui/button";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { amoy } from "@/config/chains";
import { useToast } from "@/components/ui/use-toast";
import { ethers } from "ethers";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { ESCROW_ABI } from "@/hooks/escrow/contractConstants";
import { supabase } from "@/integrations/supabase/client";

interface InitiatePaymentProps {
  transaction: {
    id: string;
    amount: number;
    seller_wallet_address: string;
  };
  onSuccess: () => void;
}

export function InitiatePayment({ transaction, onSuccess }: InitiatePaymentProps) {
  const { toast } = useToast();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setIsLoading(true);

      if (!window.ethereum) {
        throw new Error("MetaMask n'est pas installé");
      }

      // 1. Demander l'accès aux comptes MetaMask
      console.log('[InitiatePayment] Requesting MetaMask access...');
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // 2. Vérifier et changer de réseau si nécessaire
      if (chain?.id !== amoy.id) {
        console.log('[InitiatePayment] Switching network to Amoy...');
        if (!switchNetwork) {
          throw new Error("Impossible de changer de réseau automatiquement");
        }
        await switchNetwork(amoy.id);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // 3. Initialiser le provider et le signer
      console.log('[InitiatePayment] Initializing provider...');
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const signerAddress = await signer.getAddress();
      console.log('[InitiatePayment] Connected with address:', signerAddress);

      // 4. Initialiser le contrat
      const contractAddress = "0xe35a0cebf608bff98bcf99093b02469eea2cb38c";
      const contract = new ethers.Contract(contractAddress, ESCROW_ABI, signer);

      // 5. Formater le montant pour la blockchain
      const amount = transaction.amount.toString();
      const amountInWei = ethers.utils.parseUnits(amount, 18);
      console.log('[InitiatePayment] Amount in wei:', amountInWei.toString());

      // 6. Créer la transaction blockchain
      console.log('[InitiatePayment] Creating blockchain transaction...');
      const tx = await contract.createTransaction(transaction.seller_wallet_address, {
        value: amountInWei
      });

      console.log('[InitiatePayment] Transaction sent:', tx.hash);
      
      // 7. Attendre la confirmation
      const receipt = await tx.wait();
      console.log('[InitiatePayment] Transaction confirmed:', receipt);

      // 8. Trouver l'ID de transaction dans les logs
      const iface = new ethers.utils.Interface(ESCROW_ABI);
      let blockchainTxnId = null;
      
      for (const log of receipt.logs) {
        try {
          const parsedLog = iface.parseLog(log);
          if (parsedLog.name === "TransactionCreated") {
            blockchainTxnId = parsedLog.args.txnId.toString();
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!blockchainTxnId) {
        throw new Error("Impossible de récupérer l'ID de transaction blockchain");
      }

      // 9. Mettre à jour la transaction dans Supabase
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          blockchain_txn_id: blockchainTxnId,
          transaction_hash: tx.hash,
          funds_secured: true,
          funds_secured_at: new Date().toISOString(),
          status: 'processing',
          escrow_status: 'funds_secured'
        })
        .eq('id', transaction.id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Paiement réussi",
        description: "Les fonds ont été déposés dans le contrat escrow",
      });

      onSuccess();
    } catch (error: any) {
      console.error('[InitiatePayment] Error:', error);
      
      if (error.code === 4001) {
        toast({
          title: "Transaction annulée",
          description: "Vous avez refusé la transaction dans MetaMask",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur",
          description: error.message || "Une erreur est survenue lors du paiement",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isLoading}
      className="w-full"
      variant="default"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Transaction en cours...
        </>
      ) : (
        "Effectuer le paiement"
      )}
    </Button>
  );
}
