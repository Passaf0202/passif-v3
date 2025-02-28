
import { Transaction } from "./types/escrow";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, Check, Ban, AlertTriangle } from "lucide-react";

interface TransactionStatusProps {
  transaction: Transaction;
}

export function TransactionStatus({ transaction }: TransactionStatusProps) {
  // Déterminer le pourcentage d'avancement du processus
  const getProgressPercentage = () => {
    if (transaction?.escrow_status === 'completed') return 100;
    if (transaction?.escrow_status === 'cancelled') return 0;
    if (transaction?.buyer_confirmation && transaction?.seller_confirmation) return 75;
    if (transaction?.buyer_confirmation || transaction?.seller_confirmation) return 50;
    if (transaction?.funds_secured) return 25;
    return 0;
  };

  // Obtenir le statut formaté pour l'affichage
  const getStatusText = () => {
    if (transaction?.escrow_status === 'completed') return 'Terminée';
    if (transaction?.escrow_status === 'cancelled') return 'Annulée';
    if (transaction?.funds_secured) return 'En attente de confirmation';
    return 'En attente de paiement';
  };

  // Style pour les indicateurs d'étape
  const stepIndicatorStyle = (active: boolean) => 
    `w-6 h-6 rounded-full flex items-center justify-center ${
      active ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
    }`;
    
  // Déterminer si une étape est annulée
  const isCancelled = transaction?.escrow_status === 'cancelled';

  // Obtenir l'icône appropriée pour l'étape
  const getStepIcon = (isActive: boolean, stepIndex: number) => {
    if (isCancelled) {
      return <Ban className="h-4 w-4" />;
    }
    
    if (transaction?.escrow_status === 'completed' && stepIndex === 3) {
      return <Check className="h-4 w-4" />;
    }
    
    return <Clock className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-lg">Progression</h3>
          <Badge 
            variant={
              isCancelled ? "destructive" : 
              transaction?.escrow_status === 'completed' ? "success" : "default"
            }
            className={
              isCancelled ? "bg-red-500" :
              transaction?.escrow_status === 'completed' ? "bg-green-500" : ""
            }
          >
            {getStatusText()}
          </Badge>
        </div>
        <Progress value={getProgressPercentage()} className="h-2" />
      </div>

      <div className="space-y-6">
        <div className="flex items-start gap-3">
          <div className={stepIndicatorStyle(true)}>
            {getStepIcon(true, 0)}
          </div>
          <div>
            <p className="font-medium">Dépôt des fonds</p>
            <p className="text-sm text-muted-foreground">
              {isCancelled ? "La transaction a été annulée" :
               transaction?.funds_secured ? "Les fonds ont été déposés dans l'escrow" :
               "L'acheteur doit déposer les fonds dans le contrat escrow"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className={stepIndicatorStyle(transaction?.funds_secured && !isCancelled)}>
            {getStepIcon(transaction?.funds_secured && !isCancelled, 1)}
          </div>
          <div>
            <p className="font-medium">Confirmation de l'acheteur</p>
            <p className="text-sm text-muted-foreground">
              {isCancelled ? "La transaction a été annulée" :
               transaction?.buyer_confirmation ? "L'acheteur a confirmé la réception" :
               "En attente de la confirmation de l'acheteur"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className={stepIndicatorStyle(transaction?.seller_confirmation && !isCancelled)}>
            {getStepIcon(transaction?.seller_confirmation && !isCancelled, 2)}
          </div>
          <div>
            <p className="font-medium">Confirmation du vendeur</p>
            <p className="text-sm text-muted-foreground">
              {isCancelled ? "La transaction a été annulée" :
               transaction?.seller_confirmation ? "Le vendeur a confirmé la transaction" :
               "En attente de la confirmation du vendeur"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className={stepIndicatorStyle(transaction?.escrow_status === 'completed')}>
            {getStepIcon(transaction?.escrow_status === 'completed', 3)}
          </div>
          <div>
            <p className="font-medium">Fonds libérés</p>
            <p className="text-sm text-muted-foreground">
              {isCancelled ? "La transaction a été annulée" :
               transaction?.escrow_status === 'completed' ? "Les fonds ont été libérés au vendeur" :
               "Les fonds seront libérés après confirmation"}
            </p>
          </div>
        </div>
      </div>

      {!transaction?.funds_secured && !isCancelled && (
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-md text-blue-700">
          <p>
            L'acheteur n'a pas encore effectué le paiement. Vous serez
            notifié lorsque les fonds seront déposés dans l'escrow.
          </p>
        </div>
      )}
      
      {isCancelled && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-md text-red-700">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <p className="font-medium">Transaction annulée</p>
          </div>
          <p className="mt-1">
            Cette transaction a été annulée et les fonds ont été retournés à l'acheteur.
          </p>
        </div>
      )}
    </div>
  );
}
