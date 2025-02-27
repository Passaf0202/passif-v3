
import imageCompression from 'browser-image-compression';

const TARGET_SIZE_KB = 1000; // 1MB target size
const MAX_WIDTH_PX = 1920; // Maximum width 1920px

/**
 * Compresse une image pour réduire sa taille tout en maintenant une qualité acceptable
 * @param file - Le fichier image à compresser
 * @returns Un fichier image compressé
 */
export const compressImage = async (file: File): Promise<File> => {
  console.log(`Compressing image: ${file.name} (${file.size / 1024} KB)`);

  try {
    // Si le fichier est déjà petit, on le retourne tel quel
    if (file.size < TARGET_SIZE_KB * 1024) {
      console.log(`Image ${file.name} is already small enough (${file.size / 1024} KB)`);
      return file;
    }

    // Options de compression
    const options = {
      maxSizeMB: TARGET_SIZE_KB / 1024, // Taille cible en MB
      maxWidthOrHeight: MAX_WIDTH_PX,
      useWebWorker: true,
      fileType: file.type,
      initialQuality: 0.7, // Réduire la qualité pour mieux compresser
    };

    // Compresser l'image
    const compressedFile = await imageCompression(file, options);
    
    // Créer un nouveau nom de fichier avec un suffixe pour indiquer qu'il s'agit d'une version compressée
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop() || '';
    const fileNameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.'));
    const newFileName = `${fileNameWithoutExtension}_compressed.${fileExtension}`;
    
    // Créer un nouveau fichier avec le nom modifié
    const newFile = new File([compressedFile], newFileName, { 
      type: compressedFile.type,
      lastModified: new Date().getTime()
    });

    console.log(`Compression complete: ${newFile.name} (${newFile.size / 1024} KB)`);
    
    return newFile;
  } catch (error) {
    console.error('Error during image compression:', error);
    // En cas d'erreur, on retourne le fichier original
    return file;
  }
};
