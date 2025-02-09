
import { ethers } from "ethers";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { amoy } from "@/config/chains";
import { supabase } from "@/integrations/supabase/client";

const ESCROW_ABI = [
  "function releaseFunds(uint256 txnId)",
  "function transactions(uint256) view returns (address buyer, address seller, uint256 amount, bool isFunded, bool isCompleted)"
];

const ESCROW_CONTRACT_ADDRESS = "0xe35a0cebf608bff98bcf99093b02469eea2cb38c";

export function useContractInteraction() {
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  const ensureCorrectNetwork = async () => {
    if (chain?.id !== amoy.id) {
      if (!switchNetwork) {
        throw new Error("Impossible de changer de réseau automatiquement");
      }
      await switchNetwork(amoy.id);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const validateTransaction = async (txnId: number, signerAddress: string) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(
      ESCROW_CONTRACT_ADDRESS,
      ESCROW_ABI,
      provider
    );

    // Récupérer les données de la transaction du contrat
    const txData = await contract.transactions(txnId);
    console.log('Transaction data from contract:', txData);

    // Vérifie si les données sont valides
    if (!txData || !txData.buyer) {
      throw new Error("Transaction non trouvée dans le contrat");
    }

    // Vérifie si l'utilisateur est bien l'acheteur
    if (txData.buyer.toLowerCase() !== signerAddress.toLowerCase()) {
      throw new Error("Vous n'êtes pas l'acheteur de cette transaction");
    }

    // Vérifie si la transaction n'est pas déjà complétée
    if (txData.isCompleted) {
      throw new Error("Les fonds ont déjà été libérés");
    }

    return contract;
  };

  const getBlockchainTxnId = async (transactionId: string): Promise<number> => {
    try {
      const { data: transaction, error } = await supabase
        .from('transactions')
        .select('blockchain_txn_id')
        .eq('id', transactionId)
        .maybeSingle();

      if (error) {
        console.error("Erreur lors de la récupération de la transaction:", error);
        throw error;
      }
      
      if (!transaction) {
        console.error("Transaction non trouvée dans la base de données");
        throw new Error("Transaction non trouvée");
      }

      if (!transaction.blockchain_txn_id || transaction.blockchain_txn_id === '0') {
        console.error("ID de transaction blockchain non défini");
        throw new Error("ID de transaction blockchain non trouvé");
      }

      const txnId = parseInt(transaction.blockchain_txn_id);
      if (isNaN(txnId)) {
        console.error("ID de transaction blockchain invalide:", transaction.blockchain_txn_id);
        throw new Error("ID de transaction blockchain invalide");
      }

      console.log("ID de transaction blockchain récupéré:", txnId);
      return txnId;
    } catch (error) {
      console.error("Error getting blockchain transaction ID:", error);
      throw error;
    }
  };

  const releaseFunds = async (transactionId: string) => {
    try {
      console.log("Début de la libération des fonds pour la transaction:", transactionId);
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const signerAddress = await signer.getAddress();
      console.log("Adresse du signataire:", signerAddress);

      await ensureCorrectNetwork();

      const txnId = await getBlockchainTxnId(transactionId);
      console.log('ID de transaction blockchain:', txnId);

      const contract = await validateTransaction(txnId, signerAddress);
      const contractWithSigner = contract.connect(signer);

      const gasLimit = await contractWithSigner.estimateGas.releaseFunds(txnId);
      console.log('Limite de gas estimée:', gasLimit.toString());

      const tx = await contractWithSigner.releaseFunds(txnId, {
        gasLimit: gasLimit.mul(120).div(100) // Ajouter 20% de marge
      });
      console.log('Transaction envoyée:', tx.hash);

      const receipt = await tx.wait();
      console.log('Reçu de la transaction:', receipt);

      if (receipt.status === 1) {
        await supabase
          .from('transactions')
          .update({
            released_at: new Date().toISOString(),
            escrow_status: 'completed',
            status: 'completed'
          })
          .eq('id', transactionId);
        
        console.log("Mise à jour de la base de données réussie");
      }

      return receipt;
    } catch (error) {
      console.error("Error in releaseFunds:", error);
      throw error;
    }
  };

  return {
    releaseFunds
  };
}
