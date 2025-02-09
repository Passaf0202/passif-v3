
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { ethers } from "ethers";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { amoy } from "@/config/chains";

const ESCROW_ABI = [
  "function releaseFunds(uint256 txnId)",
  "function transactions(uint256) view returns (address buyer, address seller, uint256 amount, bool isFunded, bool isCompleted)"
];

const ESCROW_CONTRACT_ADDRESS = "0xe35a0cebf608bff98bcf99093b02469eea2cb38c";

export default function PaymentPage() {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const { toast } = useToast();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        if (!id) {
          throw new Error("ID de transaction manquant");
        }

        console.log("Tentative de récupération de la transaction avec ID:", id);

        const { data: transaction, error: transactionError } = await supabase
          .from('transaction_details')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        console.log("Détails de la transaction:", transaction);
        console.log("Erreur éventuelle:", transactionError);

        if (transactionError) {
          throw transactionError;
        }

        if (!transaction) {
          throw new Error("Transaction non trouvée dans la base de données");
        }

        if (transaction.released_at) {
          throw new Error("Les fonds ont déjà été libérés");
        }

        setTransactionDetails(transaction);
        setIsLoading(false);
      } catch (error: any) {
        console.error("Erreur complète:", error);
        setError(error.message || "Une erreur est survenue");
        setIsLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [id]);

  const handleReleaseFunds = async () => {
    try {
      setIsLoading(true);

      if (!window.ethereum) {
        throw new Error("MetaMask n'est pas installé");
      }

      if (chain?.id !== amoy.id) {
        if (!switchNetwork) {
          throw new Error("Impossible de changer de réseau automatiquement");
        }
        await switchNetwork(amoy.id);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const signerAddress = await signer.getAddress();
      
      // Vérifie que l'utilisateur est bien l'acheteur
      if (transactionDetails.buyer_wallet_address?.toLowerCase() !== signerAddress.toLowerCase()) {
        throw new Error("Seul l'acheteur peut libérer les fonds");
      }

      const contract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, signer);
      
      // Récupérer la transaction blockchain
      const blockchainTxnId = transactionDetails.blockchain_txn_id || '0';
      console.log("ID de transaction blockchain:", blockchainTxnId);

      // Vérifier l'état de la transaction sur la blockchain
      const txData = await contract.transactions(blockchainTxnId);
      console.log("Données de la transaction blockchain:", txData);

      if (!txData.isFunded) {
        throw new Error("Les fonds n'ont pas été déposés");
      }

      if (txData.isCompleted) {
        throw new Error("La transaction a déjà été complétée");
      }

      // Libérer les fonds
      console.log("Libération des fonds pour la transaction:", blockchainTxnId);
      const tx = await contract.releaseFunds(blockchainTxnId);
      console.log("Transaction envoyée:", tx.hash);

      const receipt = await tx.wait();
      console.log("Reçu de la transaction:", receipt);

      if (receipt.status === 1) {
        // Mettre à jour la base de données
        const { data: { user } } = await supabase.auth.getUser();
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            status: 'completed',
            escrow_status: 'completed',
            released_at: new Date().toISOString(),
            released_by: user?.id,
            buyer_confirmation: true
          })
          .eq('id', id);

        if (updateError) throw updateError;

        toast({
          title: "Succès",
          description: "Les fonds ont été libérés au vendeur",
        });

        // Recharger la page
        window.location.reload();
      } else {
        throw new Error("La transaction blockchain a échoué");
      }
    } catch (error: any) {
      console.error("Erreur lors de la libération des fonds:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la libération des fonds",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Chargement des données de la transaction...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Libération des fonds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {transactionDetails?.listing_title && (
                <div>
                  <h3 className="font-medium">Article</h3>
                  <p className="text-sm text-muted-foreground">
                    {transactionDetails.listing_title}
                  </p>
                </div>
              )}

              <div>
                <h3 className="font-medium">Montant</h3>
                <p className="text-sm text-muted-foreground">
                  {transactionDetails?.amount} {transactionDetails?.token_symbol}
                </p>
              </div>

              {transactionDetails?.seller_name && (
                <div>
                  <h3 className="font-medium">Vendeur</h3>
                  <p className="text-sm text-muted-foreground">
                    {transactionDetails.seller_name}
                  </p>
                </div>
              )}

              <Alert>
                <AlertDescription>
                  En libérant les fonds, vous confirmez avoir reçu l'article en bon état.
                  Cette action est irréversible.
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleReleaseFunds}
                disabled={isLoading || !transactionDetails}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Libération des fonds en cours...
                  </>
                ) : (
                  "Confirmer la réception et libérer les fonds"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
