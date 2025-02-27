
import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useToast } from "@/components/ui/use-toast";
import { compressImage } from "./utils/imageCompression";
import { validateFile, MAX_IMAGES, MAX_FILE_SIZE } from "./utils/imageValidation";
import { DropZone } from "./components/DropZone";
import { ImagePreview } from "./components/ImagePreview";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ImageUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  onImageUrlsChange?: (urls: string[]) => void;
  category?: string;
}

export function ImageUpload({ 
  images, 
  onImagesChange, 
  onImageUrlsChange, 
  category 
}: ImageUploadProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
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
      setProcessing(true);
      setProgress(0);
      
      // Valider les fichiers
      const validFiles = acceptedFiles.filter(validateFile);
      if (validFiles.length === 0) {
        console.log("No valid files to process");
        setProcessing(false);
        return;
      }
      
      // Informer l'utilisateur que le traitement des images est en cours
      toast({
        title: "Traitement des images",
        description: "Vos images sont en cours de préparation...",
      });
      
      // Compresser les images
      const compressedFiles = await Promise.all(
        validFiles.map(async (file, index) => {
          const compressed = await compressImage(file);
          setProgress(((index + 1) / validFiles.length) * 100);
          return compressed;
        })
      );
      
      console.log('Images compressées:', compressedFiles.map(f => ({
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
    } finally {
      setProcessing(false);
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
    disabled: processing,
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
      {processing && (
        <div className="p-4 bg-primary/5 rounded-lg space-y-2">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm font-medium">Traitement des images en cours...</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.length < MAX_IMAGES && !processing && (
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
            disabled={processing}
          >
            Tout supprimer
          </button>
        </div>
      )}
    </div>
  );
}
