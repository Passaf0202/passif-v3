import { ethers } from "ethers";

export const ESCROW_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_seller",
        "type": "address"
      }
    ],
    "stateMutability": "payable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "buyer",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "seller",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "FundsDeposited",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "confirmer",
        "type": "address"
      }
    ],
    "name": "TransactionConfirmed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "seller",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "FundsReleased",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "confirmTransaction",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getStatus",
    "outputs": [
      {
        "internalType": "bool",
        "name": "_buyerConfirmed",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "_sellerConfirmed",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "_fundsReleased",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_seller",
        "type": "address"
      }
    ],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

// Le bytecode du contrat compilé
export const ESCROW_BYTECODE = "0x608060405234801561001057600080fd5b50604051610d2a380380610d2a8339818101604052604081101561003357600080fd5b810190808051906020019092919080519060200190929190505050600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161461008957600080fd5b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16146100c357600080fd5b8173ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146100fd57600080fd5b33600060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555080600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555081600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550505061bb8061020e6000396000f3fe60806040526004361061009c5760003560e01c80635b7633d0116100645780635b7633d0146101fb5780637150d8ae1461022c5780637c3a00fd1461028357806387788782146102ae578063b214faa5146102df578063c19d93fb1461031c576100e7565b806317d7de7c146100ec578063200d2ed21461017957806338af3eed146101a45780634685a5871461019b5780634a79d50c146101d0576100e7565b366100e757600080fd5b600080fd5b3480156100f857600080fd5b506101016103";

// Fonction utilitaire pour formater les montants en wei
export const formatAmount = (amount: number): ethers.BigNumber => {
  return ethers.utils.parseEther(amount.toString());
};
