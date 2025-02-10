
import { useState } from "react";
import { ethers } from "ethers";
import { supabase } from "@/integrations/supabase/client";
import { Transaction, ESCROW_ABI } from "../types/escrow";
import { useToast } from "@/components/ui/use-toast";

export const useEscrowDetailsTransaction = (transactionId: string) => {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const { toast } = useToast();

  const fetchTransaction = async () => {
    try {
      setIsFetching(true);
      
      const { data: txnData, error: txnError } = await supabase
        .from("transactions")
        .select(`
          *,
          listings (
            *
          ),
          buyer:profiles!transactions_buyer_id_fkey (
            *
          ),
          seller:profiles!transactions_seller_id_fkey (
            *
          )
        `)
        .eq("id", transactionId)
        .maybeSingle();

      if (txnError) {
        console.error("Error fetching transaction:", txnError);
        throw new Error("Impossible de charger les détails de la transaction");
      }

      if (!txnData) {
        if (!window.ethereum) {
          throw new Error("MetaMask n'est pas installé");
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(
          "0xe35a0cebf608bff98bcf99093b02469eea2cb38c",
          ESCROW_ABI,
          provider
        );

        const latestBlock = await provider.getBlockNumber();
        const events = await contract.queryFilter('*', latestBlock - 1000, latestBlock);
        
        console.log("Found blockchain events:", events);

        // Si nous trouvons des événements correspondants, créer l'enregistrement dans Supabase
        if (events.length > 0) {
          // Convertir l'ID de transaction en BigNumber
          const txnIdBN = ethers.BigNumber.from(transactionId);
          const txn = await contract.getTransaction(txnIdBN);
          console.log("Transaction details from contract:", txn);

          const amountInEther = parseFloat(ethers.utils.formatEther(txn.amount || '0'));
          console.log("Parsed amount:", amountInEther);

          const transactionData = {
            amount: amountInEther,
            blockchain_txn_id: txnIdBN.toString(),
            status: 'pending',
            escrow_status: 'pending',
            commission_amount: amountInEther * 0.05,
            token_symbol: 'ETH',
            can_be_cancelled: true,
            funds_secured: false,
            buyer_confirmation: false,
            seller_confirmation: false
          };

          const { data: newTransaction, error: createError } = await supabase
            .from('transactions')
            .insert(transactionData)
            .select()
            .single();

          if (createError) {
            console.error("Error creating transaction:", createError);
            throw new Error("Erreur lors de la création de la transaction");
          }

          setTransaction(newTransaction);
        } else {
          throw new Error("Transaction non trouvée sur la blockchain");
        }
      } else {
        setTransaction(txnData);
      }
    } catch (error: any) {
      console.error("Error in fetchTransaction:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors du chargement des données",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  return {
    transaction,
    isLoading,
    setIsLoading,
    isFetching,
    fetchTransaction
  };
};
