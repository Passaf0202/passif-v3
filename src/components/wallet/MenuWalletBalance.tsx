
import { Loader2, Wallet } from "lucide-react";
import { useWalletBalance } from "@/hooks/useWalletBalance";

export function MenuWalletBalance() {
  const { nativeBalance, isLoading, error } = useWalletBalance();

  return (
    <div className="flex items-center justify-between w-full py-1.5 group cursor-pointer">
      <div className="flex items-center gap-2">
        <Wallet className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors" />
        <span className="text-sm">Portefeuille</span>
      </div>
      <div className="text-sm font-medium">
        {isLoading ? (
          <span className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span className="text-muted-foreground">Chargement...</span>
          </span>
        ) : error ? (
          <span className="text-red-500">Erreur</span>
        ) : (
          <span className="text-green-600">{nativeBalance || "0.00"}</span>
        )}
      </div>
    </div>
  );
}
