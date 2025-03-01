
import { useModelViewer } from "./hooks/useModelViewer";
import type { DiamondViewerProps } from "./types/diamond-viewer";

export function DiamondViewer({ state, scale = 3.5 }: DiamondViewerProps) {
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
        camera-controls
        rotation-per-second={getRotationSpeed()}
        rotation-axis="0 1 0"
        orientation="0deg 270deg 0deg"
        interaction-prompt="none"
        camera-orbit="35deg 75deg 105%"
        min-camera-orbit="auto auto 75%"
        max-camera-orbit="auto auto 150%"
        camera-target="0 0 0"
        orbit-sensitivity="1"
        interpolation-decay="100"
        min-field-of-view="10deg"
        max-field-of-view="30deg"
        auto-rotate-delay={0}
        shadow-intensity="0"
        exposure="0.8"
        environment-image="neutral"
        field-of-view="20deg"
        bounds="tight"
        scale={`${scale} ${scale} ${scale}`}
        min-scale={scale}
        max-scale={scale}
        disable-zoom
        loading="eager"
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent',
          transition: 'opacity 0.5s ease-in-out',
          '--model-color': state === 'confirmed' ? '#22c55e' : '#ffffff',
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
