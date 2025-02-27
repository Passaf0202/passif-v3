
import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Smartphone, Loader2, CheckCircle2 } from "lucide-react";

interface QRCodePaymentProps {
  paymentUrl: string;
  sellerAddress: string;
  cryptoAmount?: number;
  cryptoCurrency?: string;
  isConnected: boolean;
}

export function QRCodePayment({ 
  paymentUrl, 
  sellerAddress, 
  cryptoAmount, 
  cryptoCurrency,
  isConnected
}: QRCodePaymentProps) {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'completed'>('idle');

  // Simuler l'état de paiement - dans un cas réel, cela serait connecté à des événements blockchain
  useEffect(() => {
    if (status === 'scanning') {
      const timer = setTimeout(() => {
        setStatus('completed');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Créer un lien de paiement pour le wallet mobile
  const getPaymentDeepLink = () => {
    // Format exemple: ethereum:0xAddress@chainId/transfer?value=0.1&gasLimit=21000
    const chainId = '80002'; // Polygon Amoy testnet
    const formattedAmount = cryptoAmount ? cryptoAmount.toString() : '0';
    
    return `ethereum:${sellerAddress}@${chainId}/transfer?value=${formattedAmount}`;
  };

  const handleStartScan = () => {
    setStatus('scanning');
  };

  const handleReset = () => {
    setStatus('idle');
  };

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
                <QRCodeSVG 
                  value={getPaymentDeepLink()} 
                  size={180} 
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: "/lovable-uploads/5ad1660b-54eb-4f69-909b-76b405159178.png",
                    height: 35,
                    width: 35,
                    excavate: true,
                  }}
                />
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
