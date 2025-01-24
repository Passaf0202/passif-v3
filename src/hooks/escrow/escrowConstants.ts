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
  }
];

export const ESCROW_BYTECODE = "0x608060405260405161091838038061091883398181016040528101906100259190610208565b336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555080600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550346002819055506000600360006101000a81548160ff02191690831515021790555060006003600160006101000a81548160ff02191690831515021790555060006003600260006101000a81548160ff021916908315150217905550506102555b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415610165576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161015c90610220565b60405180910390fd5b3073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614156101d3576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016101ca90610220565b60405180910390fd5b5b600080fd5b600081519050610200816102255b92915050565b60006020828403121561021e57600080fd5b600061022c848285016101f1565b91505092915050565b6000602082019050818103600083015261024f816101a8565b9050919050565b6000819050919050565b6000610269826102555b9050919050565b61027981610255565b811461028457600080fd5b5056fea2646970667358221220f3f8f2f8f2f8f2f8f2f8f2f8f2f8f2f8f2f8f2f8f2f8f2f8f2f8f2f8f2f8f864736f6c63430008070033";