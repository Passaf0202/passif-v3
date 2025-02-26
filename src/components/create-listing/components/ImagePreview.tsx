
import { X } from "lucide-react";

interface ImagePreviewProps {
  url: string;
  index: number;
  onRemove: (index: number) => void;
}

export function ImagePreview({ url, index, onRemove }: ImagePreviewProps) {
  return (
    <div className="relative aspect-square">
      <img
        src={url}
        alt={`Image ${index + 1}`}
        className="w-full h-full object-cover rounded-lg"
      />
      <button
        onClick={() => onRemove(index)}
        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

