
import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Smartphone, Loader2, CheckCircle2 } from "lucide-react";
import { usePaymentTransaction } from "@/hooks/usePaymentTransaction";
import { useWeb3Modal } from '@web3modal/react';
import { ethers } from "ethers";

interface QRCodePaymentProps {
  paymentUrl: string;
  sellerAddress: string;
  cryptoAmount?: number;
  cryptoCurrency?: string;
  isConnected: boolean;
  listingId: string;
}

export function QRCodePayment({ 
  paymentUrl, 
  sellerAddress, 
  cryptoAmount, 
  cryptoCurrency,
  isConnected,
  listingId
}: QRCodePaymentProps) {
  // États locaux
  const [status, setStatus] = useState<'idle' | 'scanning' | 'completed'>('idle');
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [qrCodeValue, setQrCodeValue] = useState<string>("");
  
  // Hook pour ouvrir le modal Web3
  const { open } = useWeb3Modal();
  
  // Hook de transaction
  const { isProcessing, handlePayment } = usePaymentTransaction({
    listingId,
    address: sellerAddress,
    onTransactionHash: (hash: string) => {
      console.log('Transaction hash obtenu:', hash);
    },
    onPaymentComplete: (txId: string) => {
      console.log('Paiement QR terminé:', txId);
      setTransactionId(txId);
      setStatus('completed');
    },
    onTransactionCreated: (id: string) => {
      console.log('Transaction ID créée:', id);
    }
  });

  // Générer le deep link WalletConnect
  const getWalletConnectUri = () => {
    // Utiliser le même URI que le lien profond WalletConnect utilise sur mobile
    return `https://metamask.app.link/dapp/${window.location.host}/checkout?listingId=${listingId}`;
  };

  // Générer le lien de paiement direct pour le QR code
  const generatePaymentUri = () => {
    if (!cryptoAmount || !sellerAddress) return "";
    
    try {
      // Convertir le montant en wei pour Ethereum
      const amountInWei = cryptoAmount ? 
        ethers.utils.parseEther(cryptoAmount.toString()).toString() : 
        "0";
      
      // Format standard Ethereum pour transactions mobiles
      // ethereum:<address>@<chainId>/transfer?value=<amount>&gas=21000
      // Ce format sera reconnu par MetaMask et autres wallets
      return `ethereum:${sellerAddress}/transfer?value=${amountInWei}`;
    } catch (error) {
      console.error("Erreur lors de la génération de l'URI de paiement:", error);
      return "";
    }
  };

  // Initialiser l'URI du QR code
  useEffect(() => {
    if (isConnected && sellerAddress && cryptoAmount) {
      const uri = generatePaymentUri();
      console.log("URI générée pour QR code de paiement:", uri);
      setQrCodeValue(uri);
    }
  }, [isConnected, sellerAddress, cryptoAmount]);

  // Fonction pour lancer le processus sur mobile
  const handleMobileWalletProcess = async () => {
    console.log("Démarrage du processus de paiement mobile");
    setStatus('scanning');
    
    try {
      // Utiliser la même méthode que le bouton Payer sur mobile
      await open();
      
      // Démarrer le processus de paiement après connexion
      setTimeout(async () => {
        try {
          await handlePayment();
        } catch (error) {
          console.error('Erreur pendant le paiement:', error);
          setStatus('idle');
        }
      }, 2000);
    } catch (error) {
      console.error('Erreur de connexion au wallet:', error);
      setStatus('idle');
    }
  };

  // Réinitialiser l'état
  const handleReset = () => {
    setStatus('idle');
    setTransactionId(null);
  };

  // Affichage conditionnel si non connecté
  if (!isConnected) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Connectez votre wallet pour afficher le QR code de paiement
          </p>
          <Button disabled className="w-full" variant="outline">
            Wallet non connecté
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full">
      <CardContent className="p-6 flex flex-col items-center justify-center h-full">
        <h3 className="text-lg font-medium mb-4">Paiement via wallet mobile</h3>
        
        {/* État initial - Affichage du QR code */}
        {status === 'idle' && (
          <>
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground mb-4">
                Scannez ce QR code avec votre wallet mobile pour effectuer le paiement
              </p>
              
              {/* QR Code pour paiement direct */}
              <div className="bg-white p-4 rounded-xl inline-block mb-2">
                {qrCodeValue ? (
                  <QRCodeSVG 
                    value={qrCodeValue} 
                    size={180} 
                    level="H"
                    includeMargin={true}
                    imageSettings={{
                      src: "/lovable-uploads/7c5b6193-fe5d-4dde-a165-096a9ddf0037.png",
                      height: 35,
                      width: 35,
                      excavate: true,
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center w-[180px] h-[180px]">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
              
              <p className="text-xs text-gray-500 mb-4">
                Compatible avec MetaMask, WalletConnect et autres wallets Ethereum
              </p>
              
              {/* Bouton pour continuer avec le wallet - Même bouton que sur mobile */}
              <div className="mt-2">
                <Button 
                  onClick={handleMobileWalletProcess} 
                  className="w-full" 
                  variant="default"
                  disabled={isProcessing}
                >
                  <Smartphone className="mr-2 h-4 w-4" />
                  {isProcessing ? "Connexion..." : "Continuer avec wallet mobile"}
                </Button>
              </div>
            </div>
            
            {/* Détails de la transaction */}
            <div className="w-full space-y-4 mt-4">
              <p className="text-xs text-center text-muted-foreground">
                Montant: {cryptoAmount?.toFixed(8)} {cryptoCurrency}
              </p>
              <p className="text-xs text-center text-muted-foreground truncate">
                Destinataire: {sellerAddress ? `${sellerAddress.substring(0, 6)}...${sellerAddress.substring(sellerAddress.length - 4)}` : ''}
              </p>
              
              {/* Onglets d'instructions pour différents wallets */}
              <div className="flex justify-center space-x-2">
                <Tabs defaultValue="metamask" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="metamask">MetaMask</TabsTrigger>
                    <TabsTrigger value="walletconnect">WalletConnect</TabsTrigger>
                    <TabsTrigger value="rainbow">Rainbow</TabsTrigger>
                  </TabsList>
                  <TabsContent value="metamask" className="text-xs text-center p-2">
                    Ouvrez MetaMask sur votre téléphone et utilisez la fonction scanner
                  </TabsContent>
                  <TabsContent value="walletconnect" className="text-xs text-center p-2">
                    Ouvrez un wallet compatible WalletConnect et scannez le code
                  </TabsContent>
                  <TabsContent value="rainbow" className="text-xs text-center p-2">
                    Ouvrez Rainbow Wallet et utilisez la fonction scanner
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </>
        )}
        
        {/* État de traitement - Connexion en cours */}
        {status === 'scanning' && (
          <div className="text-center py-8">
            <div className="flex justify-center mb-6">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Traitement en cours</h3>
            <p className="text-sm text-muted-foreground">
              Veuillez confirmer la transaction dans votre application mobile
            </p>
          </div>
        )}
        
        {/* État de succès - Paiement terminé */}
        {status === 'completed' && (
          <div className="text-center py-8">
            <div className="flex justify-center mb-6">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">Paiement réussi!</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Votre transaction a été traitée avec succès. Merci pour votre achat!
            </p>
            <Button onClick={handleReset} variant="outline">
              Retour
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
