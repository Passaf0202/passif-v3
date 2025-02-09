
import { useState } from "react";
import { ethers } from "ethers";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
    listingId?: string
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

      // Récupérer les informations de l'annonce avec l'adresse du wallet
      if (listingId) {
        const { data: listing, error: listingError } = await supabase
          .from('listings')
          .select(`
            *,
            user:profiles!listings_user_id_fkey (
              id,
              wallet_address
            )
          `)
          .eq('id', listingId)
          .single();

        if (listingError) {
          console.error('Error fetching listing:', listingError);
          throw new Error("Erreur lors de la récupération des informations de l'annonce");
        }

        if (!listing) {
          throw new Error("Annonce introuvable");
        }

        // Vérifier que l'adresse du vendeur correspond
        const listingSellerAddress = listing.wallet_address || listing.user?.wallet_address;
        if (listingSellerAddress?.toLowerCase() !== sellerAddress.toLowerCase()) {
          console.error('Seller address mismatch:', {
            expected: listingSellerAddress,
            received: sellerAddress
          });
          throw new Error("L'adresse du vendeur ne correspond pas à celle de l'annonce");
        }
      }

      // Créer la transaction blockchain
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

      // Si nous avons un listingId, créer une entrée dans la table transactions
      if (listingId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("Utilisateur non connecté");
        }

        const { data: listing } = await supabase
          .from('listings')
          .select('user_id, wallet_address')
          .eq('id', listingId)
          .single();

        if (!listing) {
          throw new Error("Annonce introuvable");
        }

        const { data: transaction, error: transactionError } = await supabase
          .from('transactions')
          .insert({
            listing_id: listingId,
            buyer_id: user.id,
            seller_id: listing.user_id,
            amount: cryptoAmount,
            commission_amount: cryptoAmount * 0.05,
            smart_contract_address: CONTRACT_ADDRESS,
            chain_id: network.chainId,
            network: 'polygon_amoy',
            token_symbol: 'POL',
            transaction_hash: tx.hash,
            seller_wallet_address: listing.wallet_address || sellerAddress,
            funds_secured: true,
            funds_secured_at: new Date().toISOString(),
            blockchain_txn_id: receipt.events?.[0]?.args?.[0]?.toString() || '0'
          })
          .select()
          .single();

        if (transactionError) {
          console.error('Error creating transaction:', transactionError);
          throw new Error("Erreur lors de la création de la transaction");
        }

        if (transaction) {
          toast({
            title: "Transaction réussie",
            description: "Les fonds ont été bloqués dans le contrat d'escrow",
          });
          
          // Rediriger vers la page de libération des fonds
          navigate(`/release-funds/${transaction.id}`);
          return tx.hash;
        }
      }

      return tx.hash;

    } catch (error: any) {
      console.error('Payment error:', error);
      
      if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error("Solde POL insuffisant pour payer les frais de transaction");
      } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        throw new Error("Erreur lors de l'estimation des frais. Veuillez réessayer.");
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error("Erreur de connexion au réseau. Veuillez vérifier votre connexion et réessayer.");
      } else if (error.message?.includes('execution reverted')) {
        throw new Error("Le contrat a rejeté la transaction. Veuillez vérifier les paramètres.");
      }
      
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return { handlePayment, isProcessing, error, transactionStatus };
};
