
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { ethers } from "ethers";
import { amoy } from "@/config/chains";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const ESCROW_ABI = [
  "function transactionCount() view returns (uint256)",
  "function transactions(uint256) view returns (address buyer, address seller, uint256 amount, bool buyerConfirmed, bool sellerConfirmed, bool fundsReleased)",
  "function releaseFunds(uint256 txnId)"
];

const ESCROW_CONTRACT_ADDRESS = "0xe35a0cebf608bff98bcf99093b02469eea2cb38c";

export default function PaymentPage() {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [blockchainTxId, setBlockchainTxId] = useState<number | null>(null);
  const [sellerAddress, setSellerAddress] = useState<string | null>(null);
  const { toast } = useToast();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  useEffect(() => {
    const fetchSellerAddress = async () => {
      try {
        if (!id) {
          throw new Error("ID de transaction manquant");
        }

        console.log("Recherche de la transaction avec l'ID:", id);

        // Récupérer d'abord les détails de la transaction depuis Supabase
        const { data: transaction, error: transactionError } = await supabase
          .from('transactions')
          .select(`
            *,
            listings (
              title,
              crypto_amount,
              crypto_currency,
              wallet_address
            )
          `)
          .eq('id', id)
          .maybeSingle();

        console.log("Résultat de la requête:", { transaction, transactionError });

        if (transactionError) {
          console.error("Erreur Supabase:", transactionError);
          throw transactionError;
        }

        if (!transaction) {
          throw new Error("Transaction non trouvée dans la base de données");
        }

        setTransactionDetails(transaction);

        // Si l'adresse du vendeur est déjà dans la transaction, l'utiliser
        if (transaction.seller_wallet_address) {
          console.log("Adresse du vendeur trouvée dans la transaction:", transaction.seller_wallet_address);
          setSellerAddress(transaction.seller_wallet_address);
          return;
        }

        // Sinon, la récupérer depuis le contrat blockchain
        if (!window.ethereum) {
          throw new Error("MetaMask n'est pas installé");
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, provider);

        // Utiliser le blockchain_sequence_number stocké dans Supabase
        if (transaction.blockchain_sequence_number !== null) {
          console.log("Recherche dans la blockchain avec sequence number:", transaction.blockchain_sequence_number);
          const txnData = await contract.transactions(transaction.blockchain_sequence_number);
          
          if (txnData && txnData.seller && txnData.seller !== ethers.constants.AddressZero) {
            console.log("Adresse du vendeur trouvée dans la blockchain:", txnData.seller);
            setSellerAddress(txnData.seller);
            setBlockchainTxId(transaction.blockchain_sequence_number);

            // Mettre à jour l'adresse dans Supabase
            const { error: updateError } = await supabase
              .from('transactions')
              .update({ seller_wallet_address: txnData.seller })
              .eq('id', id);

            if (updateError) {
              console.error("Erreur lors de la mise à jour de l'adresse:", updateError);
            }
          } else {
            throw new Error("Données blockchain invalides");
          }
        } else {
          throw new Error("Numéro de séquence blockchain manquant");
        }

        setIsLoading(false);
      } catch (error: any) {
        console.error("Erreur détaillée:", error);
        setError(error.message || "Une erreur est survenue");
        setIsLoading(false);
      }
    };

    fetchSellerAddress();
  }, [id]);

  const handleReleaseFunds = async () => {
    if (!window.ethereum || !sellerAddress || blockchainTxId === null) {
      toast({
        title: "Erreur",
        description: "Impossible de libérer les fonds: données manquantes",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      if (chain?.id !== amoy.id) {
        if (switchNetwork) {
          await switchNetwork(amoy.id);
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          throw new Error("Impossible de changer de réseau");
        }
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, signer);

      console.log("Libération des fonds pour la transaction:", blockchainTxId);
      const tx = await contract.releaseFunds(blockchainTxId);
      console.log("Transaction envoyée:", tx.hash);

      const receipt = await tx.wait();
      console.log("Reçu de la transaction:", receipt);

      if (receipt.status === 1) {
        if (id) {
          const { error: updateError } = await supabase
            .from('transactions')
            .update({
              status: 'completed',
              escrow_status: 'completed',
              released_at: new Date().toISOString(),
              buyer_confirmation: true
            })
            .eq('id', id);

          if (updateError) throw updateError;
        }

        toast({
          title: "Succès",
          description: "Les fonds ont été libérés au vendeur",
        });
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
              {transactionDetails?.listings?.title && (
                <div>
                  <h3 className="font-medium">Article</h3>
                  <p className="text-sm text-muted-foreground">
                    {transactionDetails.listings.title}
                  </p>
                </div>
              )}

              <div>
                <h3 className="font-medium">Montant</h3>
                <p className="text-sm text-muted-foreground">
                  {transactionDetails?.listings?.crypto_amount} {transactionDetails?.listings?.crypto_currency}
                </p>
              </div>

              {sellerAddress && (
                <div>
                  <h3 className="font-medium">Adresse du vendeur</h3>
                  <p className="text-sm text-muted-foreground break-all">
                    {sellerAddress}
                  </p>
                </div>
              )}

              <Alert>
                <AlertDescription>
                  En libérant les fonds, vous confirmez avoir reçu l'article en bon état.
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleReleaseFunds}
                disabled={isLoading || !sellerAddress || blockchainTxId === null}
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
