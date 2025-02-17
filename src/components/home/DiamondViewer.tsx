
import { useModelViewer } from "./hooks/useModelViewer";
import type { DiamondViewerProps } from "./types/diamond-viewer";

export function DiamondViewer({ state }: DiamondViewerProps) {
  const {
    modelRef,
    isModelViewerReady,
    getRotationSpeed,
    MODEL_PATH
  } = useModelViewer(state);

  if (!isModelViewerReady) {
    return null;
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
        scale="3 3 3"
        loading="eager"
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent',
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
    </div>
  );
}

export default DiamondViewer;
