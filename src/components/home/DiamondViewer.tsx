
import { lazy, Suspense } from 'react';
import { Loader2 } from "lucide-react";

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
        },
        HTMLElement
      >;
    }
  }
}

const MODEL_PATH = 'https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/models/Logo%20Tradecoiner%20-%203D.glb';

export function DiamondViewer({ state }: DiamondViewerProps) {
  return (
    <div className="w-[200px] h-[200px] relative">
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
          className="w-full h-full"
          style={{ backgroundColor: 'transparent' }}
        >
          <div slot="progress-bar" className="w-full h-1 bg-gray-200 rounded">
            <div className="h-full bg-primary rounded animate-pulse" style={{ width: '100%' }}></div>
          </div>
        </model-viewer>
      </Suspense>
    </div>
  );
}

export default DiamondViewer;
