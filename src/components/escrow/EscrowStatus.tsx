import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { amoy } from "@/config/chains";

interface EscrowStatusProps {
  status: string;
  escrow_status: string;
}

export function EscrowStatus({ status, escrow_status }: EscrowStatusProps) {
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { toast } = useToast();

  const isWrongNetwork = chainId !== amoy.id;

  const handleSwitchNetwork = async () => {
    try {
      if (switchChain) {
        await switchChain({ chainId: amoy.id });
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de changer de réseau automatiquement",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du changement de réseau",
        variant: "destructive",
      });
    }
  };

  const getStatusMessage = () => {
    switch (escrow_status) {
      case "pending":
        return "En attente du paiement de l'acheteur";
      case "funded":
        return "Fonds sécurisés, en attente de confirmation";
      case "completed":
        return "Transaction complétée";
      case "cancelled":
        return "Transaction annulée";
      default:
        return "Statut inconnu";
    }
  };

  const getStatusColor = () => {
    switch (escrow_status) {
      case "pending":
        return "text-gray-500";
      case "funded":
        return "text-yellow-500";
      case "completed":
        return "text-green-500";
      case "cancelled":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="rounded-md border p-4">
      <div className="flex items-center space-x-3">
        <Shield className={`h-5 w-5 ${getStatusColor()}`} />
        <p className="text-sm font-medium">
          Statut de la transaction: <span className={getStatusColor()}>{getStatusMessage()}</span>
        </p>
      </div>
      {isWrongNetwork && address && (
        <div className="mt-2">
          <p className="text-sm text-red-500">
            Vous êtes sur le mauvais réseau. Veuillez passer au réseau Polygon Amoy pour continuer.
          </p>
          <Button onClick={handleSwitchNetwork} variant="secondary" size="sm">
            Changer de réseau
          </Button>
        </div>
      )}
    </div>
  );
}
