
-- Création du bucket s'il n'existe pas déjà
INSERT INTO storage.buckets (id, name, public)
SELECT 'listings-images', 'listings-images', true
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'listings-images'
);

-- Politique pour permettre l'upload d'images à tous les utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to upload images 1h3g2" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'listings-images'
);

-- Politique pour permettre à tout le monde de voir les images
CREATE POLICY "Give public access to images 1s52k"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'listings-images');

-- Politique pour permettre aux utilisateurs de supprimer leurs propres images
CREATE POLICY "Users can delete their own images 1g42j"
ON storage.objects FOR DELETE
TO authenticated
USING (auth.uid() = owner);

