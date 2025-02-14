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

let modelViewerScriptLoaded = false;

export function DiamondViewer({ state }: DiamondViewerProps) {
  const [isModelViewerReady, setModelViewerReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [hasError, setHasError] = useState(false);
  const modelRef = useRef<HTMLElement>(null);
  const initializeAttempts = useRef(0);

  useEffect(() => {
    if (!modelViewerScriptLoaded) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js';
      script.onload = () => {
        console.log('Model Viewer script loaded successfully');
        modelViewerScriptLoaded = true;
        setModelViewerReady(true);
      };
      script.onerror = (error) => {
        console.error('Error loading Model Viewer script:', error);
        setHasError(true);
      };
      document.head.appendChild(script);
    } else {
      setModelViewerReady(true);
    }
  }, []);

  useEffect(() => {
    if (isModelViewerReady && initializeAttempts.current < 3) {
      const checkModelViewer = () => {
        if (customElements.get('model-viewer')) {
          console.log('Model Viewer component is ready');
          return true;
        }
        initializeAttempts.current++;
        return false;
      };

      const interval = setInterval(() => {
        if (checkModelViewer()) {
          clearInterval(interval);
        } else if (initializeAttempts.current >= 3) {
          clearInterval(interval);
          setHasError(true);
          console.error('Failed to initialize Model Viewer after 3 attempts');
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isModelViewerReady]);

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

      const preloadModel = async () => {
        try {
          const response = await fetch(MODEL_PATH);
          if (!response.ok) throw new Error('Failed to preload model');
          const blob = await response.blob();
          console.log('Model preloaded successfully');
        } catch (error) {
          console.error('Error preloading model:', error);
        }
      };

      preloadModel();

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
      <div className="w-full h-full flex items-center justify-center bg-transparent rounded-lg">
        <Loader2 className="h-5 w-5 animate-spin text-primary/50" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-transparent rounded-lg">
        <div className="text-center text-red-500/80 text-sm">
          <p>Erreur de chargement</p>
          <p className="text-xs">Veuillez rafraîchir la page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-transparent rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute top-0 left-0 right-0 z-10">
          <div className="h-0.5 bg-gray-100/50">
            <div 
              className="h-full bg-primary/30 transition-all duration-300" 
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>
      )}
      <model-viewer
        ref={modelRef}
        src={MODEL_PATH}
        auto-rotate
        camera-controls
        rotation-per-second="15deg"
        interaction-prompt="none"
        min-camera-orbit="45deg 60deg 1.5m"
        max-camera-orbit="45deg 75deg 2.5m"
        camera-orbit="45deg 65deg 2m"
        shadow-intensity="0.4"
        exposure="0.6"
        environment-image="neutral"
        loading="eager"
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent',
          opacity: isLoading ? '0.7' : '1',
          transition: 'opacity 0.5s ease-in-out'
        }}
      >
        <div slot="progress-bar"></div>
        <div slot="poster"></div>
      </model-viewer>
    </div>
  );
}

export default DiamondViewer;
