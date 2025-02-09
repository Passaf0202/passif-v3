
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ethers } from "ethers";

const ESCROW_ABI = [
  "function transactions(uint256) view returns (address buyer, address seller, uint256 amount, bool buyerConfirmed, bool sellerConfirmed, bool fundsReleased)",
  "function transactionCount() view returns (uint256)"
];

const ESCROW_CONTRACT_ADDRESS = "0xe35a0cebf608bff98bcf99093b02469eea2cb38c";

export const useSellerAddress = (transactionId: string) => {
  const [sellerAddress, setSellerAddress] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSellerAddress = async () => {
      try {
        // Récupérer l'ID de la transaction blockchain depuis Supabase
        const { data: transaction, error: transactionError } = await supabase
          .from('transactions')
          .select('blockchain_txn_id, seller_wallet_address')
          .eq('id', transactionId)
          .single();

        if (transactionError) throw transactionError;

        if (!transaction) {
          console.error('No transaction found');
          return;
        }

        // Si nous avons déjà l'adresse du vendeur dans Supabase, l'utiliser
        if (transaction.seller_wallet_address) {
          console.log('Using seller address from Supabase:', transaction.seller_wallet_address);
          setSellerAddress(transaction.seller_wallet_address);
          return;
        }

        // Sinon, récupérer depuis le smart contract
        if (window.ethereum) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const contract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, provider);

          // Si nous avons un ID de transaction blockchain spécifique, l'utiliser
          let txnId = transaction.blockchain_txn_id;
          
          // Sinon, utiliser la dernière transaction
          if (!txnId || txnId === '0') {
            const count = await contract.transactionCount();
            txnId = (count.toNumber() - 1).toString();
            console.log('Using latest transaction ID:', txnId);
          }

          const txnData = await contract.transactions(txnId);
          console.log('Transaction data from contract:', txnData);
          
          const sellerAddressFromContract = txnData.seller;
          console.log('Seller address from contract:', sellerAddressFromContract);

          if (sellerAddressFromContract && sellerAddressFromContract !== ethers.constants.AddressZero) {
            // Mettre à jour Supabase avec l'adresse du vendeur
            await supabase
              .from('transactions')
              .update({ seller_wallet_address: sellerAddressFromContract })
              .eq('id', transactionId);

            setSellerAddress(sellerAddressFromContract);
          } else {
            throw new Error("Adresse du vendeur invalide dans le contrat");
          }
        } else {
          throw new Error("MetaMask n'est pas installé");
        }
      } catch (error: any) {
        console.error('Error fetching seller address:', error);
        toast({
          title: "Erreur",
          description: error.message || "Impossible de récupérer l'adresse du vendeur",
          variant: "destructive",
        });
      }
    };

    if (transactionId) {
      fetchSellerAddress();
    }
  }, [transactionId, toast]);

  return sellerAddress;
};
