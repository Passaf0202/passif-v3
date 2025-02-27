
export class TransactionError extends Error {
  code: string;
  
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    this.name = 'TransactionError';
  }
}

export const TransactionErrorCodes = {
  AMOUNT_MISMATCH: 'AMOUNT_MISMATCH',
  SELLER_ADDRESS_MISSING: 'SELLER_ADDRESS_MISSING',
  SELLER_ADDRESS_MISMATCH: 'SELLER_ADDRESS_MISMATCH',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  NETWORK_ERROR: 'NETWORK_ERROR',
  EVENT_NOT_FOUND: 'EVENT_NOT_FOUND',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  PROVIDER_ERROR: 'PROVIDER_ERROR',
  // Ajout des codes manquants
  NOT_CONNECTED: 'NOT_CONNECTED',
  INVALID_BLOCKCHAIN_ID: 'INVALID_BLOCKCHAIN_ID',
  UNAUTHORIZED: 'UNAUTHORIZED',
  ALREADY_COMPLETED: 'ALREADY_COMPLETED',
  BLOCKCHAIN_ERROR: 'BLOCKCHAIN_ERROR'
} as const;
