
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
      <DropZone 
        {...getRootProps()} 
        isDragActive={isDragActive}
      >
        <input {...getInputProps()} />
      </DropZone>

      {previewUrls.map((url, index) => (
        <ImagePreview
          key={index}
          url={url}
          index={index}
          onRemove={removeImage}
        />
      ))}
    </div>
  );
}

