
import { ethers } from 'ethers';

export const ESCROW_ABI = [
  "function createTransaction(address seller) payable returns (uint256)",
  "function confirmTransaction(uint256 txnId)",
  "function getTransaction(uint256 txnId) view returns (address buyer, address seller, uint256 amount, bool buyerConfirmed, bool sellerConfirmed, bool fundsReleased)",
  "event TransactionCreated(uint256 indexed txnId, address indexed buyer, address indexed seller, uint256 amount)",
  "event FundsDeposited(uint256 indexed txnId, address indexed buyer, address indexed seller, uint256 amount)"
];

export const CONTRACT_ADDRESS = "0xe35a0cebf608bff98bcf99093b02469eea2cb38c";

export const formatAmount = (amount: number): string => {
  return amount.toFixed(18).replace(/\.?0+$/, '');
};

export const getEscrowContract = (provider: ethers.providers.Web3Provider) => {
  const signer = provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, ESCROW_ABI, signer);
};

export const parseTransactionId = async (receipt: ethers.ContractReceipt): Promise<number> => {
  const iface = new ethers.utils.Interface(ESCROW_ABI);
  
  console.log('Processing transaction logs...', receipt);
  console.log('Number of logs:', receipt.logs.length);

  // Parcourir tous les logs en commençant par le dernier (le plus récent)
  for (let i = receipt.logs.length - 1; i >= 0; i--) {
    const log = receipt.logs[i];
    console.log('Processing log:', {
      address: log.address,
      topics: log.topics,
      data: log.data
    });

    if (log.address.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()) {
      try {
        const parsed = iface.parseLog(log);
        console.log('Successfully parsed log:', {
          name: parsed.name,
          args: parsed.args
        });

        // D'abord chercher TransactionCreated
        if (parsed.name === 'TransactionCreated') {
          const txnId = parsed.args.txnId.toNumber();
          console.log('Found TransactionCreated event with txnId:', txnId);
          return txnId;
        }
        
        // Si on ne trouve pas TransactionCreated, chercher FundsDeposited
        if (parsed.name === 'FundsDeposited') {
          const txnId = parsed.args.txnId.toNumber();
          console.log('Found FundsDeposited event with txnId:', txnId);
          return txnId;
        }
      } catch (e) {
        console.log('Error parsing log:', e);
        continue;
      }
    }
  }

  throw new Error("Impossible de récupérer l'ID de transaction dans les logs");
};
