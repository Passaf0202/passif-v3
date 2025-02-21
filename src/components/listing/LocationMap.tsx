
import { MapPin } from "lucide-react";

interface LocationMapProps {
  location: string;
}

export const LocationMap = ({ location }: LocationMapProps) => {
  return (
    <div className="relative h-[200px] rounded-lg overflow-hidden bg-gray-100">
      <div className="absolute inset-0 flex items-center justify-center">
        <MapPin className="h-8 w-8 text-primary fill-primary" strokeWidth={1.5} />
      </div>
      <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-lg shadow">
        <p className="text-sm font-medium">{location}</p>
      </div>
    </div>
  );
};
