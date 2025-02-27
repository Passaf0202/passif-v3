
import { toast } from "@/components/ui/use-toast";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_IMAGES = 5;

export const validateFile = (file: File): boolean => {
  // Vérifier le type de fichier (uniquement images)
  if (!file.type.startsWith('image/')) {
    toast({
      title: "Type de fichier non supporté",
      description: `Le fichier ${file.name} n'est pas une image`,
      variant: "destructive",
    });
    return false;
  }
  
  // Vérifier les extensions autorisées
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (!allowedTypes.includes(file.type)) {
    toast({
      title: "Format non supporté",
      description: `Seuls les formats JPG et PNG sont acceptés`,
      variant: "destructive",
    });
    return false;
  }
  
  // Vérifier la taille du fichier
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
