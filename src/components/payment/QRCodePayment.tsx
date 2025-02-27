
import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Smartphone, Loader2, CheckCircle2 } from "lucide-react";
import { usePaymentTransaction } from "@/hooks/usePaymentTransaction";

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
  const [status, setStatus] = useState<'idle' | 'scanning' | 'completed'>('idle');
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [walletConnectUri, setWalletConnectUri] = useState<string | null>(null);
  
  // Utiliser le même hook que pour le paiement direct
  const { isProcessing, handlePayment } = usePaymentTransaction({
    listingId,
    address: sellerAddress,
    onTransactionHash: (hash: string) => {
      console.log('QR code payment transaction hash:', hash);
    },
    onPaymentComplete: (txId: string) => {
      console.log('QR code payment complete:', txId);
      setTransactionId(txId);
      setStatus('completed');
    },
    onTransactionCreated: (id: string) => {
      console.log('QR code transaction created:', id);
    }
  });

  // Simuler l'état de paiement - dans un cas réel, cela serait connecté à des événements blockchain
  useEffect(() => {
    if (status === 'scanning' && !isProcessing && !transactionId) {
      // On ne met plus de timer automatique, on attend que la transaction soit réellement complétée
      // via onPaymentComplete
    }
  }, [status, isProcessing, transactionId]);
  
  // Fonction pour générer l'URI WalletConnect qui sera encodée dans le QR code
  const generateWalletConnectUri = async () => {
    try {
      // Cette fonction simule la génération d'une URI WalletConnect
      // Dans un environnement réel, elle serait générée par la bibliothèque WalletConnect
      
      // Format: wc:{sessionId}@{version}?bridge={bridgeUrl}&key={key}
      // Pour un test, on peut utiliser une URI de test qui sera interceptée par les wallets mobiles
      
      // Nous allons utiliser une URI WalletConnect v2 simulée pour le test
      const mockWcUri = `wc:7b2672db-46ab-4a3a-9492-79e${Date.now()}@2?relay-protocol=irn&symKey=7815e525e698f9a39b20a48ef5bcd2e3c04f7c2cfcc80d4b4f2a8ab2f54a1e7b`;
      setWalletConnectUri(mockWcUri);
      return mockWcUri;
    } catch (error) {
      console.error('Error generating WalletConnect URI:', error);
      return null;
    }
  };

  const handleStartScan = async () => {
    setStatus('scanning');
    
    try {
      // Déclencher la transaction de la même manière que le bouton de paiement mobile
      await handlePayment();
    } catch (error) {
      console.error('Error during QR payment:', error);
      setStatus('idle');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setTransactionId(null);
  };

  useEffect(() => {
    if (isConnected && !walletConnectUri) {
      generateWalletConnectUri();
    }
  }, [isConnected, walletConnectUri]);

  if (!isConnected) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Veuillez connecter votre portefeuille pour générer un QR code de paiement
          </p>
          <Button disabled className="w-full" variant="outline">
            Connexion requise
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full">
      <CardContent className="p-6 flex flex-col items-center justify-center h-full">
        <h3 className="text-lg font-medium mb-4">Payer avec un wallet mobile</h3>
        
        {status === 'idle' && (
          <>
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground mb-4">
                Scannez ce QR code avec votre wallet mobile pour payer directement
              </p>
              <div className="bg-white p-3 rounded-xl inline-block">
                {walletConnectUri ? (
                  <QRCodeSVG 
                    value={walletConnectUri} 
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
              <div className="mt-4">
                <Button onClick={handleStartScan} className="w-full" variant="outline">
                  <Smartphone className="mr-2 h-4 w-4" />
                  J'ai scanné le QR code
                </Button>
              </div>
            </div>
            
            <div className="w-full space-y-4 mt-4">
              <p className="text-xs text-center text-muted-foreground">
                {cryptoAmount?.toFixed(8)} {cryptoCurrency} ({sellerAddress})
              </p>
              <div className="flex justify-center space-x-2">
                <Tabs defaultValue="metamask" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="metamask">MetaMask</TabsTrigger>
                    <TabsTrigger value="walletconnect">WalletConnect</TabsTrigger>
                    <TabsTrigger value="rainbow">Rainbow</TabsTrigger>
                  </TabsList>
                  <TabsContent value="metamask" className="text-xs text-center p-2">
                    Ouvrez l'app MetaMask et scannez le code
                  </TabsContent>
                  <TabsContent value="walletconnect" className="text-xs text-center p-2">
                    Utilisez WalletConnect dans votre app préférée
                  </TabsContent>
                  <TabsContent value="rainbow" className="text-xs text-center p-2">
                    Ouvrez Rainbow Wallet et scannez le QR code
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </>
        )}
        
        {status === 'scanning' && (
          <div className="text-center py-8">
            <div className="flex justify-center mb-6">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Vérification du paiement...</h3>
            <p className="text-sm text-muted-foreground">
              Veuillez confirmer la transaction sur votre application mobile
            </p>
          </div>
        )}
        
        {status === 'completed' && (
          <div className="text-center py-8">
            <div className="flex justify-center mb-6">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">Paiement détecté!</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Nous avons détecté votre paiement. Le traitement peut prendre quelques instants.
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
