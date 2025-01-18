import { Loader2, Wallet } from "lucide-react";
import { useWalletBalance } from "@/hooks/useWalletBalance";

export function WalletBalance() {
  const { nativeBalance, isLoading, error } = useWalletBalance();

  if (error) {
    console.error('Wallet balance error:', error);
    return (
      <div className="flex items-center gap-2 bg-primary/5 py-1.5 px-3 rounded-full">
        <Wallet className="h-4 w-4 text-red-500" />
        <span className="text-xs text-red-500">Erreur</span>
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-2 bg-primary/5 py-1.5 px-3 rounded-full">
      <Wallet className="h-4 w-4 text-primary" />
      <div className="text-xs">
        {isLoading ? (
          <span className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Chargement...
          </span>
        ) : (
          <span className="text-green-600 font-medium">{nativeBalance || "0.00"}</span>
        )}
      </div>
    </div>
  );
}