
import { ImagePlus } from "lucide-react";
import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ImageUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  category?: string;
}

export function ImageUpload({ images, onImagesChange, category }: ImageUploadProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const { toast } = useToast();
  const MAX_IMAGES = 5;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const validateFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Type de fichier non valide",
        description: `Le fichier ${file.name} n'est pas une image`,
        variant: "destructive",
      });
      return false;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Fichier trop volumineux",
        description: `${file.name} dépasse la limite de 5MB`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log("Files dropped:", acceptedFiles.map(f => ({ 
      name: f.name, 
      type: f.type, 
      size: f.size 
    })));
    
    const totalImages = images.length + acceptedFiles.length;
    if (totalImages > MAX_IMAGES) {
      toast({
        title: "Trop d'images",
        description: `Vous pouvez ajouter un maximum de ${MAX_IMAGES} photos`,
        variant: "destructive",
      });
      return;
    }

    const validImageFiles = acceptedFiles.filter(validateFile);
    if (validImageFiles.length === 0) {
      return;
    }

    const newImages = [...images, ...validImageFiles].slice(0, MAX_IMAGES);
    onImagesChange(newImages);

    const urls = newImages.map(file => URL.createObjectURL(file));
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls(urls);
  }, [images, onImagesChange, previewUrls, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxFiles: MAX_IMAGES,
    maxSize: MAX_FILE_SIZE
  });

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);

    const newUrls = [...previewUrls];
    URL.revokeObjectURL(newUrls[index]);
    newUrls.splice(index, 1);
    setPreviewUrls(newUrls);

    toast({
      title: "Image supprimée",
      description: "L'image a été retirée de votre annonce",
    });
  };

  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div
        {...getRootProps()}
        className={`relative aspect-square cursor-pointer hover:bg-gray-50 transition-colors border-2 border-dashed ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center h-full p-4">
          <ImagePlus className="h-8 w-8 mb-2 text-gray-400" />
          <span className="text-sm text-center text-gray-500">
            {isDragActive ? 'Déposez les images ici' : 'Glissez ou cliquez pour ajouter'}
          </span>
          <span className="text-xs text-center text-gray-400 mt-2">
            Max {MAX_IMAGES} images, 5MB par image
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
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
