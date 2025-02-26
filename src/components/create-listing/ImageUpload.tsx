
import { ImagePlus } from "lucide-react";
import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
  const TARGET_FILE_SIZE = 200 * 1024; // Viser 200KB par image

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Réduire la taille de l'image si elle est trop grande
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);

          // Ajuster la qualité de compression en fonction de la taille
          let quality = 0.7;
          const maxAttempts = 5;
          let attempts = 0;

          const compressWithQuality = (q: number) => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('Could not create blob'));
                  return;
                }

                // Si la taille est encore trop grande et qu'on n'a pas dépassé le nombre max de tentatives
                if (blob.size > TARGET_FILE_SIZE && attempts < maxAttempts) {
                  attempts++;
                  quality = Math.max(0.1, quality - 0.1); // Réduire la qualité mais pas en dessous de 0.1
                  compressWithQuality(quality);
                  return;
                }

                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              },
              'image/jpeg',
              q
            );
          };

          compressWithQuality(quality);
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const validateFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Type de fichier non supporté",
        description: `Le fichier ${file.name} n'est pas une image`,
        variant: "destructive",
      });
      return false;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Fichier trop volumineux",
        description: `${file.name} dépasse la taille maximale de ${MAX_FILE_SIZE/1024/1024}MB`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    console.log("Dropped files:", acceptedFiles.map(f => ({ name: f.name, type: f.type, size: f.size })));
    
    const totalImages = images.length + acceptedFiles.length;
    if (totalImages > MAX_IMAGES) {
      toast({
        title: "Trop d'images",
        description: `Vous pouvez ajouter un maximum de ${MAX_IMAGES} photos`,
        variant: "destructive",
      });
      return;
    }

    try {
      const validFiles = acceptedFiles.filter(validateFile);
      const compressedFiles = await Promise.all(validFiles.map(compressImage));
      
      console.log('Tailles des fichiers compressés:', compressedFiles.map(f => ({
        name: f.name,
        size: `${(f.size / 1024).toFixed(2)}KB`
      })));

      const newImages = [...images, ...compressedFiles].slice(0, MAX_IMAGES);
      onImagesChange(newImages);

      const urls = newImages.map(file => URL.createObjectURL(file));
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setPreviewUrls(urls);
    } catch (error) {
      console.error('Error processing images:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du traitement des images",
        variant: "destructive",
      });
    }
  }, [images, onImagesChange, previewUrls, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
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
          <span className="text-xs text-gray-400 mt-2">
            Max {MAX_IMAGES} images optimisées automatiquement
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
    </div>
  );
}
