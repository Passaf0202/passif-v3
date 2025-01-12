import { User, Truck } from "lucide-react";

interface ShippingInfoProps {
  method: string | null | undefined;
}

export const ShippingInfo = ({ method }: ShippingInfoProps) => {
  if (!method) return null;

  return (
    <div className="flex gap-2 mt-2">
      {method === 'both' && (
        <>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <User className="h-4 w-4" />
            <span>En main propre</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Truck className="h-4 w-4" />
            <span>Livraison</span>
          </div>
        </>
      )}
      {method === 'pickup' && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <User className="h-4 w-4" />
          <span>En main propre</span>
        </div>
      )}
      {method === 'delivery' && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Truck className="h-4 w-4" />
          <span>Livraison</span>
        </div>
      )}
    </div>
  );
};