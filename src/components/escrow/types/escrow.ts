
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
  listings?: {
    title: string;
  };
  buyer?: {
    id: string;
  };
  seller?: {
    id: string;
  };
}

export const ESCROW_ABI = [
  "function releaseFunds(uint256 txnId)",
  "function getTransaction(uint256 txnId) view returns (address buyer, address seller, uint256 amount, bool isFunded, bool isCompleted)",
  "function transactions(uint256) view returns (address buyer, address seller, uint256 amount, bool isFunded, bool isCompleted)"
];

export const ESCROW_CONTRACT_ADDRESS = "0xe35a0cebf608bff98bcf99093b02469eea2cb38c";
