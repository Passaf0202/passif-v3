import { Card, CardContent } from "@/components/ui/card";
import { ImageUpload } from "./ImageUpload";
import { Info } from "lucide-react";

interface PhotosSectionProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  category?: string;
}

export function PhotosSection({ images, onImagesChange, category }: PhotosSectionProps) {
  const isVehicle = category === "Véhicules";

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {isVehicle && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted p-4 rounded-lg">
              <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Conseils pour les photos de véhicules :</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Photo principale : vue 3/4 avant du véhicule</li>
                  <li>Vue arrière et profil</li>
                  <li>Intérieur : tableau de bord, sièges</li>
                  <li>Détails importants : jantes, compteur kilométrique</li>
                  <li>Photos des éventuels défauts</li>
                </ul>
              </div>
            </div>
          )}
          <ImageUpload
            images={images}
            onImagesChange={onImagesChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}