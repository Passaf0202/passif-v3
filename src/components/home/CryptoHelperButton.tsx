
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, ExternalLink } from "lucide-react";

export function CryptoHelperButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-8 right-8 z-40">
        <Button 
          onClick={() => setOpen(true)}
          className="rounded-full h-14 w-14 md:h-auto md:w-auto md:rounded-md md:px-4 md:py-2 shadow-lg flex items-center justify-center gap-2"
        >
          <HelpCircle className="h-6 w-6 md:h-5 md:w-5" />
          <span className="hidden md:inline">Besoin d'aide avec les cryptos ?</span>
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouveau dans le monde des cryptomonnaies ?</DialogTitle>
            <DialogDescription>
              Pas de souci, nous sommes là pour vous aider à comprendre et utiliser Tradecoiner facilement.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-lg mb-2">Qu'est-ce qu'un wallet crypto ?</h3>
              <p className="text-gray-700">
                Un wallet (portefeuille) est comme votre compte bancaire personnel pour vos cryptomonnaies. 
                Il vous permet de stocker, envoyer et recevoir des cryptos de façon sécurisée.
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-lg mb-2">Comment acheter sur Tradecoiner ?</h3>
              <p className="text-gray-700">
                Connectez votre wallet, choisissez un produit, et payez en quelques clics. 
                Vos fonds sont sécurisés par notre système d'escrow jusqu'à la réception de votre achat.
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-lg mb-2">Comment vendre sur Tradecoiner ?</h3>
              <p className="text-gray-700">
                Créez une annonce, ajoutez votre adresse de wallet pour recevoir les paiements.
                Dès qu'un acheteur paie, vous en êtes notifié et pouvez expédier le produit.
              </p>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="sm:w-auto w-full"
            >
              J'ai compris
            </Button>
            <Button 
              className="sm:w-auto w-full"
              onClick={() => window.open('/guide', '_blank')}
            >
              Guide complet <ExternalLink className="ml-1 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
