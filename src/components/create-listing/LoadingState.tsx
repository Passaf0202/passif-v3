
import { Loader2 } from "lucide-react";

export function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="mt-2 text-muted-foreground">Chargement...</p>
      </div>
    </div>
  );
}
