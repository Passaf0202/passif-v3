import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, Info } from "lucide-react";
import { Button } from "../ui/button";
import { formatPrice } from "@/utils/priceUtils";
import { useCurrencyStore } from "@/stores/currencyStore";
import { useEffect, useState } from "react";

interface PriceDetailsProps {
  price: number;
  protectionFee: number;
  cryptoAmount?: number;
  cryptoCurrency?: string;
}

export const PriceDetails = ({ price, protectionFee, cryptoAmount, cryptoCurrency }: PriceDetailsProps) => {
  const totalPrice = price + protectionFee;
  const { selectedCurrency } = useCurrencyStore();
  const [convertedPrice, setConvertedPrice] = useState<number>(price);
  const [convertedTotal, setConvertedTotal] = useState<number>(totalPrice);

  useEffect(() => {
    // Here we would normally fetch real-time conversion rates
    // For now, using static conversion rates
    const conversionRates = {
      EUR: { USD: 1.1, GBP: 0.85 },
      USD: { EUR: 0.91, GBP: 0.77 },
      GBP: { EUR: 1.17, USD: 1.29 }
    };

    const convert = (amount: number) => {
      if (selectedCurrency === 'EUR') return amount;
      return amount * conversionRates.EUR[selectedCurrency as keyof typeof conversionRates.EUR];
    };

    setConvertedPrice(convert(price));
    setConvertedTotal(convert(totalPrice));
  }, [selectedCurrency, price, totalPrice]);

  const handleShieldClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const formatCryptoAmount = (amount?: number, currency?: string) => {
    if (!amount || !currency) return '';
    return `${amount.toFixed(6)} ${currency}`;
  };

  return (
    <div className="flex items-center gap-1 mt-1">
      <span className="text-xs text-gray-500">
        {formatPrice(convertedPrice)} {selectedCurrency}
        {cryptoAmount && cryptoCurrency && (
          <span className="ml-1">({formatCryptoAmount(cryptoAmount, cryptoCurrency)})</span>
        )}
      </span>
      <span className="text-xs font-medium text-primary flex items-center gap-1">
        {formatPrice(convertedTotal)} {selectedCurrency}
        <Dialog>
          <DialogTrigger asChild onClick={handleShieldClick}>
            <Button variant="ghost" size="sm" className="p-0 h-auto">
              <Shield className="h-4 w-4 text-blue-500" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold mb-4">Détails du prix</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Article</span>
                  <span>{formatPrice(price)} €</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span>Frais de Protection acheteurs</span>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-0 h-auto">
                          <Info className="h-4 w-4 text-gray-500" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold mb-4">Protection acheteurs</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                          <div>
                            <h4 className="font-semibold mb-2">Politique de remboursement</h4>
                            <p className="text-gray-600 mb-2">
                              Tu peux obtenir un remboursement si ta commande :
                            </p>
                            <ul className="list-disc ml-5 text-gray-600">
                              <li>est perdue ou n'est jamais livrée</li>
                              <li>arrive endommagée</li>
                              <li>n'est pas du tout conforme à sa description</li>
                            </ul>
                            <p className="text-gray-600 mt-2">
                              Tu disposes de 2 jours pour soumettre une réclamation à compter du moment où la livraison de la commande t'est notifiée, même si l'article n'a jamais été livré.
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Transactions sécurisées</h4>
                            <p className="text-gray-600">
                              Ton paiement est conservé en toute sécurité pendant toute la durée de la transaction. Les paiements sont cryptés par notre partenaire de paiement, ton argent est donc toujours envoyé ou reçu en toute sécurité. Le vendeur n'aura jamais accès à tes informations de paiement.
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Une équipe dédiée</h4>
                            <p className="text-gray-600">
                              N'hésite pas à contacter notre équipe support à tout moment. Elle est là pour t'aider.
                            </p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <span>{formatPrice(protectionFee)} €</span>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Les frais de port sont calculés lors de la commande.
              </p>
              <p className="text-sm text-gray-500">
                Nos frais de Protection acheteurs sont obligatoires lorsque vous achetez un article sur Tradecoiner. Ces derniers sont ajoutés chaque fois qu'un achat est validé via le bouton Acheter. Le prix de l'article est quant à lui fixé par le vendeur et peut faire l'objet de négociations.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </span>
    </div>
  );
}