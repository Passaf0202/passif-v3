import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Info } from "lucide-react";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { useAccount, useBalance } from 'wagmi';
import { Loader2 } from "lucide-react";

export function WalletSection() {
  const { address, isConnected } = useAccount();
  const { data: balance, isLoading: isBalanceLoading } = useBalance({
    address: address,
    watch: true,
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-1" />
            <div>
              <h3 className="font-medium mb-2">Sécurisez vos transactions avec votre portefeuille numérique</h3>
              <p className="text-sm text-muted-foreground mb-4">
                La connexion de votre portefeuille numérique permet de :
              </p>
              <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-2 mb-4">
                <li>Sécuriser vos transactions et vos paiements</li>
                <li>Protéger votre identité et vos informations personnelles</li>
                <li>Faciliter les remboursements en cas de litige</li>
                <li>Accéder à des fonctionnalités exclusives de la plateforme</li>
              </ul>
            </div>
          </div>

          {isConnected ? (
            <Alert className="space-y-2">
              <div className="flex items-center">
                <Info className="h-4 w-4 mr-2" />
                <AlertDescription>
                  Wallet connecté : {address?.slice(0, 6)}...{address?.slice(-4)}
                </AlertDescription>
              </div>
              <div className="text-sm text-muted-foreground pl-6">
                {isBalanceLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Chargement du solde...
                  </div>
                ) : (
                  <span>
                    Solde : {balance?.formatted} {balance?.symbol}
                  </span>
                )}
              </div>
            </Alert>
          ) : (
            <div className="flex flex-col items-center gap-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-center text-muted-foreground">
                Connectez votre portefeuille pour créer votre annonce en toute sécurité
              </p>
              <WalletConnectButton />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}