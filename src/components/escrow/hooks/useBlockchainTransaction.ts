
import { ethers } from "ethers";
import { ESCROW_ABI } from "../types/escrow";

export const useBlockchainTransaction = () => {
  const getBlockchainTransaction = async (transactionId: string) => {
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

    if (events.length === 0) {
      throw new Error("Transaction non trouvée sur la blockchain");
    }

    const txnIdBN = ethers.BigNumber.from(transactionId);
    const txn = await contract.getTransaction(txnIdBN);
    console.log("Transaction details from contract:", txn);

    const amountInEther = parseFloat(ethers.utils.formatEther(txn.amount || '0'));
    console.log("Parsed amount:", amountInEther);

    return {
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
  };

  return {
    getBlockchainTransaction
  };
};
