
import { Check, Clock, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Transaction } from "./types/escrow";

interface EscrowStatusProps {
  transaction: Transaction;
  transactionId?: string; 
  onRefresh?: () => void;
}

export function EscrowStatus({ transaction, onRefresh }: EscrowStatusProps) {
  const { escrow_status, funds_secured, buyer_confirmation, seller_confirmation } = transaction;

  const getStatusPercentage = () => {
    if (escrow_status === 'completed') return 100;
    if (escrow_status === 'cancelled') return 0;
    
    let progress = 0;
    if (funds_secured) progress += 50;
    if (funds_secured && buyer_confirmation) progress += 25;
    if (funds_secured && seller_confirmation) progress += 25;
    
    return progress;
  };

  return (
    <div className="space-y-6">
      {/* Barre de progression visuelle */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Escrow</span>
          <span>{getStatusPercentage()}%</span>
        </div>
        <Progress value={getStatusPercentage()} className="h-2" />
      </div>

      {/* Étapes détaillées */}
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            {funds_secured ? (
              <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-3 w-3 text-green-600" />
              </div>
            ) : (
              <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center">
                <Clock className="h-3 w-3 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className={`text-sm font-medium ${funds_secured ? 'text-green-600' : ''}`}>
              {funds_secured 
                ? "Fonds sécurisés dans l'escrow" 
                : "En attente du dépôt des fonds"
              }
            </p>
            <p className="text-xs text-gray-500">
              {funds_secured 
                ? "L'acheteur a déposé les fonds dans le contrat escrow" 
                : "L'acheteur doit déposer les fonds dans le contrat escrow"
              }
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            {buyer_confirmation ? (
              <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-3 w-3 text-green-600" />
              </div>
            ) : (
              <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center">
                <Clock className="h-3 w-3 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className={`text-sm font-medium ${buyer_confirmation ? 'text-green-600' : ''}`}>
              Confirmation de l'acheteur
            </p>
            <p className="text-xs text-gray-500">
              {buyer_confirmation 
                ? "L'acheteur a confirmé la réception" 
                : "En attente de la confirmation de l'acheteur"
              }
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            {seller_confirmation ? (
              <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-3 w-3 text-green-600" />
              </div>
            ) : (
              <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center">
                <Clock className="h-3 w-3 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className={`text-sm font-medium ${seller_confirmation ? 'text-green-600' : ''}`}>
              Confirmation du vendeur
            </p>
            <p className="text-xs text-gray-500">
              {seller_confirmation 
                ? "Le vendeur a confirmé l'envoi" 
                : "En attente de la confirmation du vendeur"
              }
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            {escrow_status === 'completed' ? (
              <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-3 w-3 text-green-600" />
              </div>
            ) : (
              <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center">
                <Lock className="h-3 w-3 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className={`text-sm font-medium ${escrow_status === 'completed' ? 'text-green-600' : ''}`}>
              Fonds libérés
            </p>
            <p className="text-xs text-gray-500">
              {escrow_status === 'completed' 
                ? "Les fonds ont été envoyés au vendeur" 
                : "Les fonds seront libérés après confirmation"
              }
            </p>
          </div>
        </div>
      </div>

      {onRefresh && (
        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={onRefresh}
          size="sm"
        >
          <Loader2 className="h-4 w-4 mr-2" />
          Rafraîchir l'état
        </Button>
      )}
    </div>
  );
}
