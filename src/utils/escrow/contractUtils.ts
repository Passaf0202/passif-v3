
import { ethers } from 'ethers';

export const ESCROW_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_seller",
        "type": "address"
      }
    ],
    "name": "createTransaction",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "txnId",
        "type": "uint256"
      }
    ],
    "name": "releaseFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "transactions",
    "outputs": [
      {
        "internalType": "address",
        "name": "buyer",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "seller",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isFunded",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "isCompleted",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export const CONTRACT_ADDRESS = "0x6441a3C16A73d5B3eF727FaCB4b4fC5Edb8CCe18";

export const formatAmount = (amount: number): string => {
  return amount.toFixed(18).replace(/\.?0+$/, '');
};

export const getEscrowContract = (signerOrProvider: ethers.Signer | ethers.providers.Provider) => {
  return new ethers.Contract(CONTRACT_ADDRESS, ESCROW_ABI, signerOrProvider);
};

export const parseTransactionId = async (receipt: ethers.ContractReceipt): Promise<string> => {
  if (!receipt.logs || receipt.logs.length === 0) {
    throw new Error("Aucun log trouvé dans la transaction");
  }
  const txIndex = receipt.logs[0].logIndex;
  return txIndex.toString();
};

