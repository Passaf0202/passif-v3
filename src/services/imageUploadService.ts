
import { supabase } from "@/integrations/supabase/client";

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Service pour télécharger des images via une fonction Edge
 */
export const imageUploadService = {
  /**
   * Télécharge une image vers le service de stockage
   * @param file Fichier image à télécharger
   * @returns Résultat contenant l'URL de l'image ou une erreur
   */
  async uploadImage(file: File): Promise<UploadResult> {
    try {
      // Préparer le FormData pour l'envoi
      const formData = new FormData();
      formData.append('image', file);

      // Obtenir le token d'authentification
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return { 
          success: false, 
          error: "Vous devez être connecté pour télécharger des images" 
        };
      }

      // Appeler la fonction Edge pour télécharger l'image
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || 'https://khqmoyqakgwdqixnsxzl.supabase.co'}/functions/v1/upload-image`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Image upload failed:', errorData);
        return { 
          success: false, 
          error: errorData.error || "Erreur lors du téléchargement de l'image" 
        };
      }

      const data = await response.json();
      return { 
        success: true, 
        url: data.url
      };
    } catch (error) {
      console.error('Error in uploadImage:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Erreur inconnue" 
      };
    }
  },

  /**
   * Télécharge plusieurs images en parallèle
   * @param files Liste des fichiers à télécharger
   * @param onProgress Callback optionnel pour suivre la progression
   * @returns Liste des URLs des images téléchargées
   */
  async uploadMultipleImages(
    files: File[], 
    onProgress?: (completed: number, total: number) => void
  ): Promise<string[]> {
    const uploadPromises = files.map(async (file, index) => {
      const result = await this.uploadImage(file);
      
      if (onProgress) {
        onProgress(index + 1, files.length);
      }
      
      if (!result.success || !result.url) {
        throw new Error(result.error || "Échec du téléchargement");
      }
      
      return result.url;
    });

    try {
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading multiple images:', error);
      throw error;
    }
  }
};
