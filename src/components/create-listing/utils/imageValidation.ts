
import { toast } from "@/components/ui/use-toast";

export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
export const MAX_IMAGES = 5;

export const validateFile = (file: File): boolean => {
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

