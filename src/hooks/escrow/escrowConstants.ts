// ABI du contrat CryptoEscrow
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
        "name": "_paymentToken",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_platformFee",
        "type": "uint256"
      }
    ],
    "stateMutability": "payable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "seller",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "platform",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "paymentToken",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "platformFee",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "amount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
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
      }
    ],
    "name": "FundsReleased",
    "type": "event"
  }
];

// Bytecode du contrat CryptoEscrow
export const ESCROW_BYTECODE = "0x608060405260405161091838038061091883398181016040528101906100259190610213565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161461008a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161008190610299565b60405180910390fd5b3373ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16146100f8576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016100ef906102b9565b60405180910390fd5b6000341161013a576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610131906102d9565b60405180910390fd5b33600060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555080600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055503460028190555060008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1634604051610208929190610308565b60405180910390a150610341565b60008151905061020d8161032d565b92915050565b6000602082840312156102255761022461032b565b5b6000610233848285016101fe565b91505092915050565b600082825260208201905092915050565b7f496e76616c696420736c6c657220616464726573730000000000000000000000600082015250565b7f53656c6c65722063616e6e6f74206265206275796572000000000000000000006000820152506000610293601583610238565b9150610293601583610238565b91506102a2826102a2565b602082019050919050565b600060208201905081810360008301526102c68161027c565b9050919050565b600060208201905081810360008301526102e68161029c565b9050919050565b600060208201905081810360008301526103068161027c565b9050919050565b60006040820190508181036000830152610326818461023c565b90509392505050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b61033681610317565b811461034157600080fd5b50565b6105c8806103506000396000f3";