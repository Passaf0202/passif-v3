
import { ImagePlus } from "lucide-react";
import { DropzoneRootProps } from "react-dropzone";
import { MAX_IMAGES } from "../utils/imageValidation";

interface DropZoneProps extends DropzoneRootProps {
  isDragActive: boolean;
}

export function DropZone({ isDragActive, ...rootProps }: DropZoneProps) {
  return (
    <div
      {...rootProps}
      className={`relative aspect-square cursor-pointer hover:bg-gray-50 transition-colors border-2 border-dashed ${
        isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'
      }`}
    >
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
  );
}
