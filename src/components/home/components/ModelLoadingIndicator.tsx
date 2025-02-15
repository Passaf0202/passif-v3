
import { Loader2 } from "lucide-react";

interface ModelLoadingIndicatorProps {
  progress: number;
}

export function ModelLoadingIndicator({ progress }: ModelLoadingIndicatorProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-transparent">
      <div className="bg-white/80 px-4 py-2 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary/70" />
          <span className="text-xs text-primary/70">
            Chargement {Math.round(progress)}%
          </span>
        </div>
      </div>
    </div>
  );
}
