
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface EscrowActionButtonProps {
  isLoading: boolean;
  isUserBuyer: boolean;
  onClick: () => Promise<void>;
}

export function EscrowActionButton({
  isLoading,
  isUserBuyer,
  onClick
}: EscrowActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      className="w-full bg-purple-500 hover:bg-purple-600"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Libération des fonds en cours...
        </>
      ) : (
        "Confirmer la réception"
      )}
    </Button>
  );
}
