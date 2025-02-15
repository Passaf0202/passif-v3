
import { Loader2 } from "lucide-react";
import { useModelViewer } from "./hooks/useModelViewer";
import { ModelLoadingIndicator } from "./components/ModelLoadingIndicator";
import type { DiamondViewerProps } from "./types/diamond-viewer";

export function DiamondViewer({ state }: DiamondViewerProps) {
  const {
    modelRef,
    isModelViewerReady,
    isLoading,
    loadingProgress,
    hasError,
    getRotationSpeed,
    MODEL_PATH
  } = useModelViewer(state);

  if (!isModelViewerReady) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-transparent">
        <Loader2 className="h-5 w-5 animate-spin text-primary/50" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-transparent">
        <div className="text-center text-red-500/80 text-sm">
          <p>Erreur de chargement</p>
          <p className="text-xs">Veuillez rafraîchir la page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-transparent">
      <model-viewer
        ref={modelRef}
        src={MODEL_PATH}
        auto-rotate
        rotation-per-second={getRotationSpeed()}
        rotation-axis="0 1 0"
        orientation="0deg 270deg 0deg"
        interaction-prompt="none"
        camera-orbit="35deg 85deg 1.2m"
        min-camera-orbit="35deg 85deg 1.2m"
        max-camera-orbit="35deg 85deg 1.2m"
        auto-rotate-delay={0}
        shadow-intensity="0"
        exposure="0.8"
        environment-image="neutral"
        field-of-view="18deg"
        bounds="tight"
        scale="2.4 2.4 2.4"
        loading="eager"
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent',
          opacity: isLoading ? '0.7' : '1',
          transition: 'opacity 0.5s ease-in-out',
          '--model-color': state === 'confirmed' ? '#22c55e' : 
                          state === 'processing' ? '#3b82f6' :
                          state === 'awaiting-confirmation' ? '#eab308' :
                          '#000000',
          padding: 0,
          margin: 0
        } as any}
      >
        <div slot="poster"></div>
      </model-viewer>
      
      {isLoading && loadingProgress < 100 && (
        <ModelLoadingIndicator progress={loadingProgress} />
      )}
    </div>
  );
}

export default DiamondViewer;
