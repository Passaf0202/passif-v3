import { Card, CardContent } from "@/components/ui/card";

interface ProductDetailsProps {
  details: {
    brand?: string;
    model?: string;
    year?: number;
    mileage?: number;
    condition?: string;
    color?: string[];
    transmission?: string;
    fuel_type?: string;
    doors?: number;
    crit_air?: string;
    emission_class?: string;
    shipping_method?: string;
    crypto_currency?: string;
  };
}

export const ProductDetailsCard = ({ details }: ProductDetailsProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-4">Détails du produit</h2>
        <div className="grid grid-cols-2 gap-4">
          {details.brand && (
            <div>
              <p className="text-sm text-gray-500">Marque</p>
              <p>{details.brand}</p>
            </div>
          )}
          {details.model && (
            <div>
              <p className="text-sm text-gray-500">Modèle</p>
              <p>{details.model}</p>
            </div>
          )}
          {details.year && (
            <div>
              <p className="text-sm text-gray-500">Année</p>
              <p>{details.year}</p>
            </div>
          )}
          {details.mileage && (
            <div>
              <p className="text-sm text-gray-500">Kilométrage</p>
              <p>{details.mileage.toLocaleString()} km</p>
            </div>
          )}
          {details.condition && (
            <div>
              <p className="text-sm text-gray-500">État</p>
              <p>{details.condition}</p>
            </div>
          )}
          {details.color && details.color.length > 0 && (
            <div>
              <p className="text-sm text-gray-500">Couleur</p>
              <p>{details.color.join(", ")}</p>
            </div>
          )}
          {details.transmission && (
            <div>
              <p className="text-sm text-gray-500">Transmission</p>
              <p>{details.transmission}</p>
            </div>
          )}
          {details.fuel_type && (
            <div>
              <p className="text-sm text-gray-500">Carburant</p>
              <p>{details.fuel_type}</p>
            </div>
          )}
          {details.doors && (
            <div>
              <p className="text-sm text-gray-500">Nombre de portes</p>
              <p>{details.doors}</p>
            </div>
          )}
          {details.crit_air && (
            <div>
              <p className="text-sm text-gray-500">Vignette Crit'Air</p>
              <p>{details.crit_air}</p>
            </div>
          )}
          {details.emission_class && (
            <div>
              <p className="text-sm text-gray-500">Classe d'émission</p>
              <p>{details.emission_class}</p>
            </div>
          )}
          {details.shipping_method && (
            <div>
              <p className="text-sm text-gray-500">Mode de livraison</p>
              <p>{details.shipping_method}</p>
            </div>
          )}
          {details.crypto_currency && (
            <div>
              <p className="text-sm text-gray-500">Crypto-monnaie acceptée</p>
              <p>{details.crypto_currency}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};