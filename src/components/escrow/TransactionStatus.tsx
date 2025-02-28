
import { Transaction } from "./types/escrow";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface TransactionStatusProps {
  transaction: Transaction;
}

export function TransactionStatus({ transaction }: TransactionStatusProps) {
  // Déterminer le pourcentage d'avancement du processus
  const getProgressPercentage = () => {
    if (transaction?.escrow_status === 'completed') return 100;
    if (transaction?.buyer_confirmation && transaction?.seller_confirmation) return 75;
    if (transaction?.buyer_confirmation || transaction?.seller_confirmation) return 50;
    if (transaction?.funds_secured) return 25;
    return 0;
  };

  // Obtenir le statut formaté pour l'affichage
  const getStatusText = () => {
    if (transaction?.escrow_status === 'completed') return 'Terminée';
    if (transaction?.funds_secured) return 'En attente de confirmation';
    return 'En attente de paiement';
  };

  // Style pour les indicateurs d'étape
  const stepIndicatorStyle = (active: boolean) => 
    `w-5 h-5 rounded-full flex items-center justify-center ${
      active ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
    }`;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-lg">État du paiement</h3>
          <Badge variant={transaction?.funds_secured ? "default" : "outline"}>
            {getStatusText()}
          </Badge>
        </div>
        <Progress value={getProgressPercentage()} className="h-2" />
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className={stepIndicatorStyle(true)}>
            <Clock className="h-3 w-3" />
          </div>
          <div>
            <p className="font-medium">En attente du dépôt des fonds</p>
            <p className="text-sm text-muted-foreground">
              L'acheteur doit déposer les fonds dans le contrat escrow
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className={stepIndicatorStyle(transaction?.funds_secured)}>
            <Clock className="h-3 w-3" />
          </div>
          <div>
            <p className="font-medium">Confirmation de l'acheteur</p>
            <p className="text-sm text-muted-foreground">
              En attente de la confirmation de l'acheteur
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className={stepIndicatorStyle(transaction?.seller_confirmation)}>
            <Clock className="h-3 w-3" />
          </div>
          <div>
            <p className="font-medium">Confirmation du vendeur</p>
            <p className="text-sm text-muted-foreground">
              En attente de la confirmation du vendeur
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className={stepIndicatorStyle(transaction?.escrow_status === 'completed')}>
            <Clock className="h-3 w-3" />
          </div>
          <div>
            <p className="font-medium">Fonds libérés</p>
            <p className="text-sm text-muted-foreground">
              Les fonds seront libérés après confirmation
            </p>
          </div>
        </div>
      </div>

      {!transaction?.funds_secured && (
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-md text-blue-700">
          <p>
            L'acheteur n'a pas encore effectué le paiement. Vous serez
            notifié lorsque les fonds seront déposés dans l'escrow.
          </p>
        </div>
      )}
    </div>
  );
}
