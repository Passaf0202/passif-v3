
export interface Transaction {
  id: string;
  amount: number;
  commission_amount: number;
  blockchain_txn_id: string;
  status: string;
  escrow_status: string;
  token_symbol: string;
  can_be_cancelled: boolean;
  funds_secured: boolean;
  buyer_confirmation: boolean;
  seller_confirmation: boolean;
  seller_wallet_address?: string;
  listing_title?: string;
  transaction_hash?: string;
  block_number?: number;
  buyer?: {
    id: string;
    wallet_address?: string;
    full_name?: string;
  };
  seller?: {
    id: string;
    wallet_address?: string;
    full_name?: string;
  };
  listing?: {
    title: string;
    wallet_address?: string;
    user_id?: string;
  };
}

export const ESCROW_ABI = [
  "function createTransaction(address seller) payable returns (uint256)",
  "function releaseFunds(uint256 txnId)",
  "function cancelTransaction(uint256 txnId)",
  "function transactions(uint256) view returns (address buyer, address seller, uint256 amount, bool isFunded, bool isCompleted)",
  "event FundsDeposited(uint256 indexed txnId, address buyer, uint256 amount)",
  "event FundsReleased(uint256 indexed txnId, address seller, uint256 amount)",
  "function platform() view returns (address)"
];

export const ESCROW_CONTRACT_ADDRESS = "0xe35a0cebf608bff98bcf99093b02469eea2cb38c";
