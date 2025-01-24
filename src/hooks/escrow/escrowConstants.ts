import { ethers } from "ethers";

// The ABI defines the contract interface
export const ESCROW_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_seller",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_platform",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_platformFeePercent",
        "type": "uint256"
      }
    ],
    "stateMutability": "payable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "raiser",
        "type": "address"
      }
    ],
    "name": "DisputeRaised",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "resolver",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      }
    ],
    "name": "DisputeResolved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "buyer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "seller",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "token",
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
        "indexed": false,
        "internalType": "address",
        "name": "seller",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "fee",
        "type": "uint256"
      }
    ],
    "name": "FundsReleased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "confirmer",
        "type": "address"
      }
    ],
    "name": "TransactionConfirmed",
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
    "inputs": [
      {
        "internalType": "address",
        "name": "_seller",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_platformFeePercent",
        "type": "uint256"
      }
    ],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "payable",
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
      },
      {
        "internalType": "bool",
        "name": "_disputed",
        "type": "bool"
      },
      {
        "internalType": "address",
        "name": "_token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_platformFee",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "raiseDispute",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address payable",
        "name": "recipient",
        "type": "address"
      }
    ],
    "name": "resolveDispute",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// The bytecode of the compiled contract
export const ESCROW_BYTECODE = "0x608060405260405162000c2838038062000c28833981810160405260808110156200002957600080fd5b81019080805190602001909291908051906020019092919080519060200190929190805190602001909291905050506000600073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff161462000094576200009357600080fd5b5b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1614620000d157620000d057600080fd5b5b8273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146200010e576200010d57600080fd5b5b33600060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555082600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555081600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550806003819055505050505062000a8f806200020e6000396000f3fe60806040526004361061007b5760003560e01c80635b7633d01161004e5780635b7633d0146101fb5780637150d8ae1461022c5780637c3a00fd14610283578063b214faa5146102ae5761007b565b806317d7de7c146100805780632d0335ab146100ad57806338af3eed146100d85780634685a587146101015761007b565b3661007b57005b600080fd5b34801561008c57600080fd5b506100956102db565b60405180821515815260200191505060405180910390f35b3480156100b957600080fd5b506100c26102ee565b6040518082815260200191505060405180910390f35b3480156100e457600080fd5b506100ed6102f4565b604051808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34801561010d57600080fd5b5061011661031a565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101561015657808201518184015260208101905061013b565b50505050905090810190601f1680156101835780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b3480156101a157600080fd5b506101aa6103b8565b604051808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34801561020757600080fd5b506102106103de565b604051808260ff1660ff16815260200191505060405180910390f35b34801561023857600080fd5b506102416103f1565b604051808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34801561028f57600080fd5b50610298610417565b6040518082815260200191505060405180910390f35b3480156102ba57600080fd5b506102c361041d565b60405180821515815260200191505060405180910390f35b60008060009054906101000a900460ff16905090565b60035481565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b606060018054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156103ae5780601f10610383576101008083540402835291602001916103ae565b820191906000526020600020905b81548152906001019060200180831161039157829003601f168201915b5050505050905090565b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600460009054906101000a900460ff1681565b600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60025481565b6000600660009054906101000a900460ff16905090565b6040518060400160405280600581526020017f48656c6c6f000000000000000000000000000000000000000000000000000000815250905600a165627a7a72305820f3921a8dc557de8e47480b3ff24c8fc3e0f3e7b5e2e6b73c3b89d3e6e8f6d9d40029";

// Utility function to format amounts to wei
export const formatAmount = (amount: number): ethers.BigNumber => {
  return ethers.utils.parseEther(amount.toString());
};