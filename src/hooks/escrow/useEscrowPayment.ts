import { useEscrowContract } from './useEscrowContract';
import { useTransactionManager } from './useTransactionManager';
import { validateAndUpdateCryptoAmount } from './useCryptoAmount';
import { supabase } from "@/integrations/supabase/client";
import { parseEther } from "viem";
import { useToast } from "@/components/ui/use-toast";
import { ethers } from 'ethers';

// Contract ABI and bytecode
const ESCROW_ABI = [
  "constructor(address _seller) payable",
  "function confirmTransaction() public",
  "function getStatus() public view returns (bool _buyerConfirmed, bool _sellerConfirmed, bool _fundsReleased)",
  "event FundsDeposited(address buyer, address seller, uint256 amount)",
  "event TransactionConfirmed(address confirmer)",
  "event FundsReleased(address seller, uint256 amount)"
];

const ESCROW_BYTECODE = "608060405260006003556000600460006101000a81548160ff0219169083151502179055506000600460016101000a81548160ff0219169083151502179055506000600460026101000a81548160ff0219169083151502179055506000600460036101000a81548160ff021916908315150217905550610b3b806100836000396000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c80631e6c3950146100625780635314d1001461007e5780636f9fb98a146100aa578063a035b1fe146100c8578063c040e6b8146100e6575b600080fd5b61007c60048036038101906100779190610736565b610104565b005b610088610420565b604051610095919061079c565b60405180910390f35b6100b2610446565b6040516100bf91906107c6565b60405180910390f35b6100d061044e565b6040516100dd91906107c6565b60405180910390f35b6100ee610454565b6040516100fb91906107e1565b60405180910390f35b600460029054906101000a900460ff1615610153576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161014a906108a4565b60405180910390fd5b600460039054906101000a900460ff166101a2576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610199906108c4565b60405180910390fd5b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614806102345750600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16145b610273576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161026a906108e4565b60405180910390fd5b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141561032357600460009054906101000a900460ff1615610316576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161030d90610904565b60405180910390fd5b6001600460006101000a81548160ff0219169083151502179055505b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614156103d257600460019054906101000a900460ff16156103c5576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016103bc90610924565b60405180910390fd5b6001600460016101000a81548160ff0219169083151502179055505b7f5d13ab3066618e228a9af5075be570dcf9e5c4634a1e71c4234389de56d3e69e3360035460405161040592919061094e565b60405180910390a161041d6001600460026101000a81548160ff02191690831515021790555050565b565b600460039054906101000a900460ff1681565b60035481565b60035481565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006104a38261047a565b9050919050565b6104b381610499565b81146104be57600080fd5b50565b6000813590506104d0816104aa565b92915050565b6000819050919050565b6104e9816104d6565b81146104f457600080fd5b50565b600081359050610506816104e0565b92915050565b60008060408385031215610523576105226104f7565b5b6000610531858286016104c1565b9250506020610542858286016104f7565b9150509250929050565b60008115159050919050565b6105618161054c565b82525050565b600060208201905061057c6000830184610558565b92915050565b6000819050919050565b61059581610582565b82525050565b60006020820190506105b0600083018461058c565b92915050565b6105bf81610582565b81146105ca57600080fd5b50565b6000813590506105dc816105b6565b92915050565b6000602082840312156105f8576105f76104f7565b5b6000610606848285016105cd565b91505092915050565b61061881610499565b82525050565b6000602082019050610633600083018461060f565b92915050565b600080fd5b600080fd5b600080fd5b60008083601f84011261065d5761065c610638565b5b8235905067ffffffffffffffff81111561067a5761067961063d565b5b602083019150836001820283011115610696576106956106425b5b9250929050565b600080602083850312156106b4576106b36104f7565b5b600083013567ffffffffffffffff8111156106d2576106d16104fc565b5b6106de85828601610647565b92509250509250929050565b600082825260208201905092915050565b7f4e6f7420617574686f72697a656400000000000000000000000000000000000081525060200191505060405180910390fd5b600082825260208201905092915050565b7f46756e647320616c72656164792072656c65617365640000000000000000000081525060200191505060405180910390fd5b600082825260208201905092915050565b7f4e6f2066756e6473206465706f73697465640000000000000000000000000000815250602001915050604051809103906000f35b6000819050919050565b61079681610582565b82525050565b60006020820190506107b1600083018461078d565b92915050565b6107c081610582565b82525050565b60006020820190506107db60008301846107b7565b92915050565b60006020820190506107f660008301846107b7565b92915050565b600082825260208201905092915050565b7f4e6f7420617574686f72697a65640000000000000000000000000000000000008152506020019150506040518091039060005260206000f35b600082825260208201905092915050565b7f46756e647320616c72656164792072656c65617365640000000000000000000081525060200191505060405180910390fd5b600082825260208201905092915050565b7f4e6f2066756e6473206465706f73697465640000000000000000000000000000815250602001915050604051809103906000f35b600082825260208201905092915050565b7f427579657220616c726561647920636f6e6669726d65640000000000000000008152506020019150506040518091039060005260206000f35b600082825260208201905092915050565b7f53656c6c657220616c726561647920636f6e6669726d656400000000000000008152506020019150506040518091039060005260206000f35b600082825260208201905092915050565b61094881610499565b82525050565b600060408201905061096360008301856107b7565b61097060208301846107b7565b939250505056fea2646970667358221220f3f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f864736f6c63430008000033";

interface UseEscrowPaymentProps {
  listingId: string;
  address?: string;
  onTransactionHash?: (hash: string) => void;
  onPaymentComplete: () => void;
}

export function useEscrowPayment({ 
  listingId, 
  address,
  onTransactionHash,
  onPaymentComplete 
}: UseEscrowPaymentProps) {
  const { getContract, getActiveContract } = useEscrowContract();
  const { toast } = useToast();
  const {
    isProcessing,
    setIsProcessing,
    error,
    setError,
    transactionStatus,
    setTransactionStatus,
    createTransaction,
    updateTransactionStatus
  } = useTransactionManager();

  const validateCryptoAmount = async (listing: any) => {
    if (!listing.crypto_amount || typeof listing.crypto_amount !== 'number' || listing.crypto_amount <= 0) {
      console.error('Invalid or missing crypto amount:', listing.crypto_amount);
      
      // Récupérer le taux BNB actuel
      const { data: cryptoRate, error: rateError } = await supabase
        .from('crypto_rates')
        .select('*')
        .eq('symbol', 'BNB')
        .eq('is_active', true)
        .maybeSingle();

      if (rateError || !cryptoRate) {
        console.error('Error fetching BNB rate:', rateError);
        throw new Error("Impossible de récupérer le taux de conversion BNB");
      }

      if (!cryptoRate.rate_eur || cryptoRate.rate_eur <= 0) {
        console.error('Invalid BNB rate:', cryptoRate.rate_eur);
        throw new Error("Taux de conversion BNB invalide");
      }

      const cryptoAmount = Number(listing.price) / cryptoRate.rate_eur;
      
      if (isNaN(cryptoAmount) || cryptoAmount <= 0) {
        console.error('Calculated invalid crypto amount:', {
          price: listing.price,
          rate: cryptoRate.rate_eur,
          result: cryptoAmount
        });
        throw new Error("Erreur lors du calcul du montant en crypto");
      }

      // Mettre à jour l'annonce avec le montant calculé
      const { error: updateError } = await supabase
        .from('listings')
        .update({
          crypto_amount: cryptoAmount,
          crypto_currency: 'BNB'
        })
        .eq('id', listing.id);

      if (updateError) {
        console.error('Error updating listing with crypto amount:', updateError);
        throw new Error("Erreur lors de la mise à jour du montant en crypto");
      }

      listing.crypto_amount = cryptoAmount;
      listing.crypto_currency = 'BNB';
    }

    return listing;
  };

  const handlePayment = async () => {
    if (!address) {
      setError("Veuillez connecter votre portefeuille pour continuer");
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      console.log('Starting payment process for listing:', listingId);

      // Récupérer les détails de l'annonce et du vendeur
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .select(`
          *,
          user:profiles!listings_user_id_fkey (
            wallet_address,
            id
          )
        `)
        .eq('id', listingId)
        .maybeSingle();

      if (listingError || !listing) {
        console.error('Error fetching listing:', listingError);
        throw new Error("Impossible de récupérer les détails de l'annonce");
      }

      if (!listing.user?.wallet_address) {
        console.error('No wallet address found for seller');
        throw new Error("Le vendeur n'a pas connecté son portefeuille");
      }

      // Valider et potentiellement mettre à jour le montant en crypto
      const validatedListing = await validateCryptoAmount(listing);
      console.log('Validated listing:', validatedListing);

      // Récupérer le contrat d'escrow actif
      const escrowContract = await getActiveContract();
      if (!escrowContract) {
        throw new Error("Le contrat d'escrow n'est pas disponible");
      }

      try {
        const amountInWei = parseEther(validatedListing.crypto_amount.toString());
        console.log('Amount in Wei:', amountInWei.toString());

        // Vérifier le solde avant la transaction
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const balance = await provider.getBalance(address);
        
        if (balance.lt(amountInWei)) {
          throw new Error("Fonds insuffisants dans votre portefeuille");
        }

        // Créer la transaction dans la base de données
        const transaction = await createTransaction(
          listingId,
          address,
          validatedListing.user.id,
          validatedListing.crypto_amount,
          0,
          escrowContract.address,
          escrowContract.chain_id
        );

        // Déployer un nouveau contrat d'escrow pour cette transaction
        const factory = new ethers.ContractFactory(
          ESCROW_ABI,
          ESCROW_BYTECODE,
          provider.getSigner()
        );

        console.log('Deploying new escrow contract with params:', {
          seller: validatedListing.user.wallet_address,
          value: amountInWei.toString()
        });

        const escrow = await factory.deploy(
          validatedListing.user.wallet_address,
          { value: amountInWei }
        );

        console.log('Waiting for deployment transaction:', escrow.deployTransaction.hash);
        setTransactionStatus('pending');
        
        if (onTransactionHash) {
          onTransactionHash(escrow.deployTransaction.hash);
        }

        const receipt = await escrow.deployTransaction.wait();
        console.log('Deployment receipt:', receipt);

        if (receipt.status === 1) {
          await updateTransactionStatus(
            transaction.id, 
            'processing', 
            escrow.deployTransaction.hash
          );
          
          // Mettre à jour le statut des fonds comme sécurisés
          await supabase
            .from('transactions')
            .update({
              funds_secured: true,
              funds_secured_at: new Date().toISOString(),
              smart_contract_address: escrow.address
            })
            .eq('id', transaction.id);

          setTransactionStatus('confirmed');
          toast({
            title: "Transaction confirmée",
            description: "Le paiement a été effectué avec succès",
          });
          onPaymentComplete();
        } else {
          throw new Error("La transaction a échoué sur la blockchain");
        }
      } catch (txError: any) {
        console.error('Transaction error:', txError);
        
        if (txError.code === 'INSUFFICIENT_FUNDS') {
          toast({
            title: "Fonds insuffisants",
            description: "Votre portefeuille ne contient pas assez de BNB pour effectuer cette transaction",
            variant: "destructive",
          });
          throw new Error("Fonds insuffisants dans votre portefeuille");
        }
        
        const errorMessage = txError.reason || txError.message || "La transaction a échoué";
        toast({
          title: "Erreur de transaction",
          description: errorMessage,
          variant: "destructive",
        });
        throw new Error(errorMessage);
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error.message || "Une erreur est survenue lors du paiement");
      setTransactionStatus('failed');
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors du paiement",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    error,
    transactionStatus,
    handlePayment
  };
}