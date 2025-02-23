
import { Card, CardContent } from "@/components/ui/card";
import { ImageUpload } from "./ImageUpload";
import { Info, Lightbulb } from "lucide-react";

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
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Photos de l'annonce</h3>
            <div className="flex items-center justify-center gap-2 text-primary">
              <Lightbulb className="h-5 w-5" />
              <p className="text-sm">
                Ajoutez un maximum de photos pour augmenter le nombre de contacts
              </p>
            </div>
          </div>

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

          <div className="space-y-2">
            <ImageUpload
              images={images}
              onImagesChange={onImagesChange}
            />
            <p className="text-sm text-gray-500 text-center">
              Maximum 5 photos - Glissez-déposez vos images ici
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
