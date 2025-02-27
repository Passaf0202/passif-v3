
import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useToast } from "@/components/ui/use-toast";
import { compressImage } from "./utils/imageCompression";
import { validateFile, MAX_IMAGES, MAX_FILE_SIZE } from "./utils/imageValidation";
import { DropZone } from "./components/DropZone";
import { ImagePreview } from "./components/ImagePreview";

interface ImageUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  category?: string;
}

export function ImageUpload({ images, onImagesChange, category }: ImageUploadProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const { toast } = useToast();

  // Initialiser les URLs de prévisualisation lorsque les images changent
  useEffect(() => {
    // Nettoyer les anciennes URLs
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    
    // Créer de nouvelles URLs pour les images actuelles
    const newUrls = images.map(file => URL.createObjectURL(file));
    setPreviewUrls(newUrls);
    
    // Nettoyer les URLs lors du démontage du composant
    return () => {
      newUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [images]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    console.log("Dropped files:", acceptedFiles.map(f => ({ name: f.name, type: f.type, size: f.size })));
    
    if (acceptedFiles.length === 0) {
      console.log("No files were accepted");
      return;
    }
    
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
      if (validFiles.length === 0) {
        console.log("No valid files to process");
        return;
      }
      
      // Informer l'utilisateur que le traitement des images est en cours
      toast({
        title: "Traitement des images",
        description: "Vos images sont en cours de préparation...",
      });
      
      const compressedFiles = await Promise.all(validFiles.map(compressImage));
      
      console.log('Tailles des fichiers compressés:', compressedFiles.map(f => ({
        name: f.name,
        size: `${(f.size / 1024).toFixed(2)}KB`
      })));

      const newImages = [...images, ...compressedFiles].slice(0, MAX_IMAGES);
      onImagesChange(newImages);
      
      toast({
        title: "Images ajoutées",
        description: `${compressedFiles.length} image(s) ajoutée(s) avec succès`,
      });
    } catch (error) {
      console.error('Error processing images:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du traitement des images",
        variant: "destructive",
      });
    }
  }, [images, onImagesChange, toast]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: MAX_IMAGES - images.length,
    maxSize: MAX_FILE_SIZE,
    noClick: false,
    noKeyboard: false,
  });

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
    
    toast({
      title: "Image supprimée",
      description: "L'image a été supprimée de l'annonce",
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.length < MAX_IMAGES && (
          <DropZone 
            {...getRootProps()} 
            isDragActive={isDragActive}
            onClick={open}
          >
            <input {...getInputProps()} />
          </DropZone>
        )}

        {previewUrls.map((url, index) => (
          <ImagePreview
            key={index}
            url={url}
            index={index}
            onRemove={removeImage}
          />
        ))}
      </div>
      
      {images.length > 0 && (
        <div className="text-sm text-center text-muted-foreground">
          {images.length} image(s) sur {MAX_IMAGES} - 
          <button 
            type="button" 
            onClick={() => onImagesChange([])} 
            className="text-primary hover:underline ml-1"
          >
            Tout supprimer
          </button>
        </div>
      )}
    </div>
  );
}
