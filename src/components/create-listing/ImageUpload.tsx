import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Camera, ImagePlus, Lightbulb, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface ImageUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  category?: string;
}

export function ImageUpload({ images, onImagesChange, category }: ImageUploadProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const MAX_IMAGES = 5;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log("Dropped files:", acceptedFiles.map(f => ({ name: f.name, type: f.type })));
    
    const totalImages = images.length + acceptedFiles.length;
    if (totalImages > MAX_IMAGES) {
      alert(`Vous pouvez ajouter un maximum de ${MAX_IMAGES} photos`);
      return;
    }

    // Vérifier que les fichiers sont bien des images
    const imageFiles = acceptedFiles.filter(file => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        console.error(`File ${file.name} is not an image (type: ${file.type})`);
      }
      return isImage;
    });

    const newImages = [...images, ...imageFiles].slice(0, MAX_IMAGES);
    onImagesChange(newImages);

    // Créer les URLs de prévisualisation
    const urls = newImages.map(file => URL.createObjectURL(file));
    
    // Nettoyer les anciennes URLs
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls(urls);
  }, [images, onImagesChange, previewUrls]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif']
    },
    maxFiles: MAX_IMAGES
  });

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);

    const newUrls = [...previewUrls];
    URL.revokeObjectURL(newUrls[index]);
    newUrls.splice(index, 1);
    setPreviewUrls(newUrls);
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
            Maximum {MAX_IMAGES} photos - Glissez-déposez vos images ici
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
        <div
          {...getRootProps()}
          className={`relative aspect-square cursor-pointer hover:bg-gray-50 transition-colors border-2 border-dashed ${
            isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center h-full p-4">
            <Camera className="h-8 w-8 mb-2 text-gray-400" />
            <span className="text-sm text-center text-gray-500">
              {isDragActive ? 'Déposez les images ici' : 'Glissez ou cliquez pour ajouter'}
            </span>
          </div>
        </div>

        {previewUrls.map((url, index) => (
          <div key={index} className="relative aspect-square">
            <img
              src={url}
              alt={`Image ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {isVehicle && vehiclePhotoTypes.map((type, index) => (
          <Card 
            key={index}
            className={`relative aspect-square cursor-pointer hover:bg-gray-50 transition-colors border-2 ${
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