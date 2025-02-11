
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { usePaymentTransaction } from "@/hooks/usePaymentTransaction";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { amoy } from "@/config/chains";
import { supabase } from "@/integrations/supabase/client";

interface PaymentButtonProps {
  isProcessing: boolean;
  isConnected: boolean;
  cryptoAmount?: number;
  cryptoCurrency?: string;
  onClick: () => void;
  disabled?: boolean;
  sellerAddress?: string;
  listingId: string;
}

export function PaymentButton({ 
  isProcessing, 
  isConnected, 
  cryptoAmount, 
  cryptoCurrency = 'POL',
  onClick,
  disabled = false,
  sellerAddress,
  listingId
}: PaymentButtonProps) {
  const { toast } = useToast();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { processPayment } = usePaymentTransaction();

  const handleClick = async () => {
    if (!isConnected || !sellerAddress || !cryptoAmount || !listingId) {
      toast({
        title: "Erreur",
        description: "Veuillez connecter votre wallet et vérifier les informations de paiement",
        variant: "destructive",
      });
      return;
    }

    try {
      // 1. Vérifier et changer de réseau si nécessaire
      if (chain?.id !== amoy.id) {
        if (!switchNetwork) {
          throw new Error("Impossible de changer de réseau automatiquement");
        }
        await switchNetwork(amoy.id);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // 2. Appeler onClick (qui crée la transaction dans Supabase)
      onClick();

      // 3. Récupérer l'ID de la transaction créée
      const { data: transaction } = await supabase
        .from('transactions')
        .select('id')
        .eq('listing_id', listingId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!transaction) {
        throw new Error("La transaction n'a pas été créée correctement");
      }

      // 4. Traiter le paiement avec le contrat intelligent
      await processPayment(transaction.id, sellerAddress, cryptoAmount);

    } catch (error: any) {
      console.error('Transaction error:', error);
      toast({
        title: "Erreur de transaction",
        description: error.message || "La transaction a échoué. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button 
      onClick={handleClick} 
      disabled={isProcessing || !isConnected || !cryptoAmount || disabled || !sellerAddress}
      className="w-full bg-primary hover:bg-primary/90"
    >
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Transaction en cours...
        </>
      ) : disabled ? (
        "Transaction en attente de confirmation..."
      ) : !isConnected ? (
        "Connecter votre wallet"
      ) : !sellerAddress ? (
        "Adresse du vendeur manquante"
      ) : (
        `Payer ${cryptoAmount?.toFixed(6)} ${cryptoCurrency}`
      )}
    </Button>
  );
}
