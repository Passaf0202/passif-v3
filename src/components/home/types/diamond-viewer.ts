
export type DiamondViewerState = 
  | 'initial'               
  | 'wallet-connect'        
  | 'wallet-connecting'     
  | 'payment'              
  | 'processing'           
  | 'awaiting-confirmation' 
  | 'confirmed';

export interface DiamondViewerProps {
  state: DiamondViewerState;
}

export interface ModelViewerElementAttributes {
  src: string;
  'auto-rotate'?: boolean;
  'camera-controls'?: boolean;
  'rotation-per-second'?: string;
  'interaction-prompt'?: 'auto' | 'none' | 'when-focused';
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
  'orientation'?: string;
  'rotation-axis'?: string;
  scale?: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & ModelViewerElementAttributes, HTMLElement>;
    }
  }
}
