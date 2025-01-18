import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useAccount } from 'wagmi';
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";

export default function Payment() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { address } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);

  const listing = location.state?.listing;
  const returnUrl = location.state?.returnUrl;

  if (!listing) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-500">Annonce non trouvée</p>
        </div>
      </div>
    );
  }

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      console.log('Processing crypto payment for listing:', listing.id);

      const { data, error } = await supabase.functions.invoke('create-crypto-payment', {
        body: { 
          listingId: listing.id,
          buyerAddress: address,
        }
      });

      if (error) throw error;
      console.log('Payment response:', data);

      if (data?.transactionHash) {
        toast({
          title: "Paiement réussi",
          description: "Votre transaction a été confirmée",
        });
        
        // Redirect to return URL or listing details
        navigate(returnUrl || `/listings/${listing.id}`);
      } else {
        throw new Error('Transaction failed');
      }

    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du paiement",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Paiement en Crypto</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Détails de l'annonce</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-600">Titre</p>
                <p className="font-medium">{listing.title}</p>
              </div>
              <div>
                <p className="text-gray-600">Prix</p>
                <p className="font-medium">
                  {listing.crypto_amount} {listing.crypto_currency}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Détails du paiement</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-600">Adresse du portefeuille</p>
                <p className="font-medium break-all">{address}</p>
              </div>
              <div>
                <p className="text-gray-600">Réseau</p>
                <p className="font-medium">{listing.crypto_currency}</p>
              </div>
            </div>
          </div>

          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traitement en cours...
              </>
            ) : (
              `Payer ${listing.crypto_amount} ${listing.crypto_currency}`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}