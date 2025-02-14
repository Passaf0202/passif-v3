
import { lazy, Suspense, useEffect, useState } from 'react';
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
        },
        HTMLElement
      >;
    }
  }
}

const MODEL_PATH = 'https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/models/Logo%20Tradecoiner%20-%203D.glb';

export function DiamondViewer({ state }: DiamondViewerProps) {
  const [isModelViewerReady, setModelViewerReady] = useState(false);

  useEffect(() => {
    // Vérifier si le web component est déjà défini
    if (customElements.get('model-viewer')) {
      setModelViewerReady(true);
      return;
    }

    // Si non, attendre qu'il soit défini
    const observer = new MutationObserver((mutations, obs) => {
      if (customElements.get('model-viewer')) {
        setModelViewerReady(true);
        obs.disconnect();
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, []);

  const handleError = (event: SyntheticEvent<HTMLElement, Event>) => {
    console.error('Model Viewer error:', event);
  };

  if (!isModelViewerReady) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-black/5 rounded-lg" style={{ minHeight: '200px' }}>
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      }>
        <model-viewer
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
            minHeight: '200px',
            backgroundColor: 'transparent'
          }}
          onError={handleError}
        >
          <div slot="progress-bar"></div>
          <div slot="poster"></div>
          <div className="absolute inset-0 pointer-events-none" slot="progress-bar">
            <div className="w-full h-1 bg-gray-200">
              <div className="h-full bg-primary transition-all duration-300" style={{ width: '0%' }} />
            </div>
          </div>
        </model-viewer>
      </Suspense>
    </div>
  );
}

export default DiamondViewer;
