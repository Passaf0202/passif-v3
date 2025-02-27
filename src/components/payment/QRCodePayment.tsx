
import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Smartphone, Loader2, CheckCircle2 } from "lucide-react";
import { usePaymentTransaction } from "@/hooks/usePaymentTransaction";
import { useWeb3Modal } from '@web3modal/react';

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
  const { open } = useWeb3Modal();
  
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

  // Générer une URI directe pour les wallets mobiles (au format ethereum:<address>@<chainId>)
  const getDirectWalletUri = () => {
    // Polygon Amoy testnet chainId
    const chainId = '80002';
    
    // Formats compatibles avec la plupart des wallets
    if (cryptoAmount) {
      return `ethereum:${sellerAddress}@${chainId}/transfer?value=${cryptoAmount}&gas=21000`;
    }
    
    return `ethereum:${sellerAddress}@${chainId}`;
  };

  const handleStartScan = async () => {
    setStatus('scanning');
    
    try {
      // Ouvrir directement le modal WalletConnect pour la connexion mobile
      await open();
      
      // Après connexion, déclencher le paiement
      setTimeout(async () => {
        try {
          await handlePayment();
        } catch (error) {
          console.error('Error during payment after scan:', error);
          setStatus('idle');
        }
      }, 1000);
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
    // Générer automatiquement l'URI pour le QR code
    if (isConnected && !walletConnectUri) {
      setWalletConnectUri(getDirectWalletUri());
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
              <div className="bg-white p-3 rounded-xl inline-block mb-1">
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
              <p className="text-xs text-gray-500 mb-4">
                Format compatible: WalletConnect, MetaMask, et autres wallets Ethereum
              </p>
              <div className="mt-2">
                <Button onClick={handleStartScan} className="w-full" variant="default">
                  <Smartphone className="mr-2 h-4 w-4" />
                  Continuer avec mon wallet mobile
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
                    Ouvrez l'app MetaMask et utilisez la fonction scanner
                  </TabsContent>
                  <TabsContent value="walletconnect" className="text-xs text-center p-2">
                    Utilisez la fonction WalletConnect dans votre app préférée
                  </TabsContent>
                  <TabsContent value="rainbow" className="text-xs text-center p-2">
                    Ouvrez Rainbow Wallet et utilisez la fonction scanner
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
            <h3 className="text-lg font-medium mb-2">Connexion en cours...</h3>
            <p className="text-sm text-muted-foreground">
              Veuillez confirmer la connexion et la transaction sur votre application mobile
            </p>
          </div>
        )}
        
        {status === 'completed' && (
          <div className="text-center py-8">
            <div className="flex justify-center mb-6">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">Paiement effectué !</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Votre paiement a été validé avec succès. Vous recevrez une confirmation par email.
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
