
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { ethers } from "ethers";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { amoy } from "@/config/chains";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

const ESCROW_ABI = [
  "function releaseFunds(uint256 txnId)",
  "function transactions(uint256) view returns (address buyer, address seller, uint256 amount, bool isFunded, bool isCompleted)",
  "function transactionCount() view returns (uint256)"
];

const ESCROW_CONTRACT_ADDRESS = "0xe35a0cebf608bff98bcf99093b02469eea2cb38c";

interface FundsReleaseSectionProps {
  transactionId: string;
  blockchainTxnId?: string;
  isConfirmed: boolean;
}

export function FundsReleaseSection({
  transactionId,
  blockchainTxnId,
  isConfirmed,
}: FundsReleaseSectionProps) {
  const [isReleasing, setIsReleasing] = useState(false);
  const [sellerAddress, setSellerAddress] = useState<string | null>(null);
  const { toast } = useToast();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  useEffect(() => {
    const fetchSellerAddress = async () => {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select(`
            seller_wallet_address,
            listing:listings (
              user:profiles (
                wallet_address
              )
            )
          `)
          .eq('id', transactionId)
          .single();

        if (error) throw error;

        // Try to get seller address from the transaction first
        let address = data.seller_wallet_address;
        
        // If not found, try to get it from the listing's user profile
        if (!address && data.listing?.user?.wallet_address) {
          address = data.listing.user.wallet_address;
        }

        if (address) {
          console.log('Setting seller address:', address);
          setSellerAddress(address);
        } else {
          console.error('No seller address found');
          toast({
            title: "Erreur",
            description: "Adresse du vendeur introuvable",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching seller address:', error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer l'adresse du vendeur",
          variant: "destructive",
        });
      }
    };

    fetchSellerAddress();
  }, [transactionId, toast]);

  const handleReleaseFunds = async () => {
    if (!blockchainTxnId || !sellerAddress) {
      toast({
        title: "Erreur",
        description: "ID de transaction blockchain ou adresse du vendeur manquante",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsReleasing(true);

      if (chain?.id !== amoy.id) {
        if (!switchNetwork) {
          throw new Error("Impossible de changer de réseau automatiquement");
        }
        await switchNetwork(amoy.id);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      const contract = new ethers.Contract(
        ESCROW_CONTRACT_ADDRESS,
        ESCROW_ABI,
        signer
      );

      const txnId = Number(blockchainTxnId);
      if (isNaN(txnId)) {
        throw new Error("ID de transaction blockchain invalide");
      }

      console.log('Releasing funds for blockchain transaction:', txnId);
      const tx = await contract.releaseFunds(txnId);
      console.log('Release funds transaction sent:', tx.hash);

      const receipt = await tx.wait();
      console.log('Release funds receipt:', receipt);

      if (receipt.status === 1) {
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            status: 'completed',
            escrow_status: 'completed',
            released_at: new Date().toISOString(),
            buyer_confirmation: true
          })
          .eq('id', transactionId);

        if (updateError) throw updateError;

        toast({
          title: "Fonds libérés avec succès",
          description: "Les fonds ont été envoyés au vendeur.",
        });
      } else {
        throw new Error("La transaction a échoué sur la blockchain");
      }
    } catch (error: any) {
      console.error('Error releasing funds:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la libération des fonds",
        variant: "destructive",
      });
    } finally {
      setIsReleasing(false);
    }
  };

  if (!sellerAddress) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          L'adresse du vendeur est manquante. Cette information est nécessaire pour libérer les fonds.
        </AlertDescription>
      </Alert>
    );
  }

  if (isConfirmed) {
    return (
      <Alert>
        <AlertDescription>
          Les fonds ont été libérés au vendeur.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <Alert>
        <AlertDescription>
          Une fois que vous aurez reçu l'article, cliquez sur le bouton ci-dessous pour libérer les fonds au vendeur.
        </AlertDescription>
      </Alert>

      <Button
        onClick={handleReleaseFunds}
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
    </>
  );
}
