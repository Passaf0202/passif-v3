
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ReleaseButtonProps {
  isReleasing: boolean;
  onRelease: () => void;
}

export function ReleaseButton({ isReleasing, onRelease }: ReleaseButtonProps) {
  return (
    <Button
      onClick={onRelease}
      disabled={isReleasing}
      className="w-full"
    >
      {isReleasing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Libération des fonds en cours...
        </>
      ) : (
        "Confirmer la réception et libérer les fonds"
      )}
    </Button>
  );
}
