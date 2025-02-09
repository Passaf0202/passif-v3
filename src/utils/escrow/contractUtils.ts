
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

export const parseTransactionId = async (receipt: ethers.ContractReceipt): Promise<string> => {
  const iface = new ethers.utils.Interface(ESCROW_ABI);
  
  console.log('Processing transaction logs...', receipt);
  console.log('Number of logs:', receipt.logs.length);

  if (!receipt.logs || receipt.logs.length === 0) {
    throw new Error("Aucun log trouvé dans la transaction");
  }

  // Rechercher les logs en commençant par le dernier
  for (let i = receipt.logs.length - 1; i >= 0; i--) {
    const log = receipt.logs[i];
    
    if (log.address.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()) {
      try {
        // Essayer de décoder le log
        const parsedLog = iface.parseLog(log);
        console.log('Successfully parsed log:', parsedLog);

        // Vérifier si c'est l'événement TransactionCreated ou FundsDeposited
        if (parsedLog.name === 'TransactionCreated' || parsedLog.name === 'FundsDeposited') {
          // L'ID de transaction est le premier élément dans args pour les deux événements
          const txnId = parsedLog.args.txnId.toString();
          console.log(`Found transaction ID from ${parsedLog.name} event:`, txnId);
          return txnId;
        }
      } catch (error) {
        console.log('Error parsing log:', error);
        // Continuer avec le prochain log si celui-ci ne peut pas être parsé
        continue;
      }
    }
  }

  // Si on n'a pas trouvé l'ID, essayer de récupérer les topics du dernier log
  const lastLog = receipt.logs[receipt.logs.length - 1];
  if (lastLog && lastLog.topics && lastLog.topics.length > 1) {
    // Le deuxième topic (index 1) contient souvent l'ID de transaction
    const potentialTxnId = ethers.BigNumber.from(lastLog.topics[1]).toString();
    console.log('Found potential transaction ID from topics:', potentialTxnId);
    return potentialTxnId;
  }

  throw new Error("Impossible de récupérer l'ID de transaction dans les logs");
};
