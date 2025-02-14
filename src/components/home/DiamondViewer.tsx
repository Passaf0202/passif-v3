
import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { Loader2 } from "lucide-react";
import type { SyntheticEvent } from 'react';

interface DiamondViewerProps {
  state: 'initial' | 'wallet-connect' | 'wallet-connecting' | 'search' | 'validating' | 'processing' | 'confirmed';
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src: string;
          'auto-rotate'?: boolean;
          'camera-controls'?: boolean;
          'rotation-per-second'?: string;
          'interaction-prompt'?: 'auto' | 'none';
          'interaction-prompt-style'?: 'basic' | 'wiggle';
          'interaction-prompt-threshold'?: string;
          'auto-rotate-delay'?: number;
          'min-camera-orbit'?: string;
          'max-camera-orbit'?: string;
          'shadow-intensity'?: string;
          exposure?: string;
          poster?: string;
          bounds?: string;
          'environment-image'?: string;
          loading?: 'auto' | 'lazy' | 'eager';
          'animation-name'?: string;
          'animation-crossfade-duration'?: string;
          'quick-look-browsers'?: string;
          'progress'?: number;
        },
        HTMLElement
      >;
    }
  }
}

const MODEL_PATH = 'https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/models/Logo%20Tradecoiner%20-%203D.glb';

export function DiamondViewer({ state }: DiamondViewerProps) {
  const [isModelViewerReady, setModelViewerReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [hasError, setHasError] = useState(false);
  const modelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (customElements.get('model-viewer')) {
        console.log('Model Viewer is ready');
        setModelViewerReady(true);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  const handleError = useCallback((event: SyntheticEvent<HTMLElement, Event>) => {
    console.error('Model Viewer error:', event);
    setHasError(true);
    setIsLoading(false);
  }, []);

  const handleLoad = useCallback(() => {
    console.log('Model loaded successfully');
    setIsLoading(false);
    setLoadingProgress(100);
  }, []);

  const handleProgress = useCallback((event: CustomEvent) => {
    const progress = event.detail.totalProgress * 100;
    console.log('Loading progress:', progress);
    setLoadingProgress(Math.min(progress, 100));
  }, []);

  useEffect(() => {
    if (modelRef.current) {
      const modelViewer = modelRef.current;
      modelViewer.addEventListener('error', handleError as any);
      modelViewer.addEventListener('load', handleLoad as any);
      modelViewer.addEventListener('progress', handleProgress as any);

      return () => {
        modelViewer.removeEventListener('error', handleError as any);
        modelViewer.removeEventListener('load', handleLoad as any);
        modelViewer.removeEventListener('progress', handleProgress as any);
      };
    }
  }, [handleError, handleLoad, handleProgress]);

  if (!isModelViewerReady) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black/5 rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black/5 rounded-lg">
        <div className="text-center text-red-500">
          <p>Error loading model</p>
          <p className="text-sm">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-black/5 rounded-lg">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
            <div className="text-sm text-gray-500">{Math.round(loadingProgress)}%</div>
          </div>
        </div>
      )}
      <model-viewer
        ref={modelRef}
        src={MODEL_PATH}
        auto-rotate
        camera-controls
        rotation-per-second="30deg"
        interaction-prompt="none"
        min-camera-orbit="45deg 45deg 2m"
        max-camera-orbit="135deg 135deg 4m"
        shadow-intensity="1"
        exposure="0.7"
        bounds="tight"
        environment-image="neutral"
        loading="eager"
        style={{
          width: '100%',
          height: '100%',
          minHeight: '256px',
          backgroundColor: 'transparent',
          opacity: isLoading ? '0.5' : '1',
          transition: 'opacity 0.3s ease-in-out'
        }}
      >
        <div slot="progress-bar"></div>
        <div slot="poster"></div>
        <div className="absolute inset-0 pointer-events-none" slot="progress-bar">
          <div className="w-full h-1 bg-gray-200">
            <div 
              className="h-full bg-primary transition-all duration-300" 
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>
      </model-viewer>
    </div>
  );
}

export default DiamondViewer;
