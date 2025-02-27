
import { X } from "lucide-react";

interface ImagePreviewProps {
  url: string;
  index: number;
  onRemove: (index: number) => void;
}

export function ImagePreview({ url, index, onRemove }: ImagePreviewProps) {
  return (
    <div className="relative aspect-square group">
      <img
        src={url}
        alt={`Image ${index + 1}`}
        className="w-full h-full object-cover rounded-lg border border-gray-200"
      />
      <button
        onClick={() => onRemove(index)}
        className="absolute top-2 right-2 p-1.5 bg-white/80 text-red-500 rounded-full shadow hover:bg-white hover:text-red-600 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label="Supprimer l'image"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded-full">
        {index + 1}
      </div>
    </div>
  );
}
