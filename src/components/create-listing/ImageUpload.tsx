import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface ImageUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
}

export function ImageUpload({ images, onImagesChange }: ImageUploadProps) {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      console.log("Selected files:", files);
      onImagesChange(files);
    }
  };

  return (
    <FormItem>
      <FormLabel>Images</FormLabel>
      <Input
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageChange}
      />
      <FormMessage />
    </FormItem>
  );
}