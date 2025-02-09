
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
        .select('blockchain_txn_id, funds_secured, transaction_hash')
        .eq('id', transactionId)
        .single();

      if (error) throw error;
      
      if (!transaction?.blockchain_txn_id) {
        throw new Error("ID de transaction blockchain non trouvé");
      }

      // Vérifie si le hash de transaction existe
      if (!transaction.transaction_hash) {
        throw new Error("Hash de transaction non trouvé");
      }

      const txnId = parseInt(transaction.blockchain_txn_id);
      if (isNaN(txnId)) {
        throw new Error("ID de transaction blockchain invalide");
      }

      return txnId;
    } catch (error) {
      console.error("Error getting blockchain transaction ID:", error);
      throw error;
    }
  };

  const releaseFunds = async (transactionId: string) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const signerAddress = await signer.getAddress();

      await ensureCorrectNetwork();

      const txnId = await getBlockchainTxnId(transactionId);
      console.log('Using blockchain transaction ID:', txnId);

      const contract = await validateTransaction(txnId, signerAddress);
      const contractWithSigner = contract.connect(signer);

      // Estimer le gas avec une marge de sécurité de 20%
      const gasEstimate = await contractWithSigner.estimateGas.releaseFunds(txnId);
      console.log('Estimated gas:', gasEstimate.toString());
      const gasLimit = gasEstimate.mul(120).div(100);

      const tx = await contractWithSigner.releaseFunds(txnId, {
        gasLimit: gasLimit
      });
      console.log('Transaction sent:', tx.hash);

      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);

      if (receipt.status === 1) {
        await supabase
          .from('transactions')
          .update({
            released_at: new Date().toISOString(),
            escrow_status: 'completed',
            status: 'completed'
          })
          .eq('id', transactionId);
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
