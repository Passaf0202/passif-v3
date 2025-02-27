
export type DiamondViewerState = 
  | 'initial'               // État initial
  | 'wallet-connect'        // Wallet connecté
  | 'wallet-connecting'     // En cours de connexion du wallet
  | 'payment'               // Prêt pour paiement
  | 'processing'            // En cours de traitement
  | 'awaiting-confirmation' // En attente de confirmation
  | 'confirmed';            // Transaction confirmée

export interface DiamondViewerProps {
  state?: DiamondViewerState;
  scale?: number;
}
