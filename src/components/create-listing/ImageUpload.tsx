import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Camera, ImagePlus, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ImageUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  category?: string;
}

export function ImageUpload({ images, onImagesChange, category }: ImageUploadProps) {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      console.log("Selected files:", files);
      onImagesChange(files);
    }
  };

  const isVehicle = category === "Véhicules";
  const vehiclePhotoTypes = [
    { label: "3/4 avant gauche", required: true },
    { label: "3/4 arrière droit", required: true },
    { label: "Intérieur conducteur", required: false },
    { label: "Intérieur passager", required: false },
    { label: "Profil gauche", required: false },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">Photos de l'annonce</h3>
          <p className="text-sm text-gray-500">
            Faites glisser vos photos pour changer leur ordre
          </p>
        </div>
        <div className="flex items-center gap-2 text-primary">
          <Lightbulb className="h-5 w-5" />
          <p className="text-sm">
            Ajoutez un maximum de photos pour augmenter le nombre de contacts
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="relative aspect-square cursor-pointer hover:bg-gray-50 transition-colors border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-full p-4">
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Camera className="h-8 w-8 mb-2 text-gray-400" />
            <span className="text-sm text-center text-gray-500">
              Ajouter des photos
            </span>
          </CardContent>
        </Card>

        {isVehicle && vehiclePhotoTypes.map((type, index) => (
          <Card 
            key={index}
            className={`relative aspect-square border-2 ${
              type.required ? 'border-primary border-dashed' : 'border-gray-200 border-dashed'
            }`}
          >
            <CardContent className="flex flex-col items-center justify-center h-full p-4">
              <ImagePlus className="h-8 w-8 mb-2 text-gray-400" />
              <span className="text-sm text-center text-gray-500">
                {type.label}
                {type.required && <span className="text-primary">*</span>}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {images.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            {images.length} photo{images.length > 1 ? 's' : ''} sélectionnée{images.length > 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}