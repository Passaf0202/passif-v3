
import { useEffect, useRef } from 'react';
import { useModelViewer } from './hooks/useModelViewer';
import { DiamondViewerState, DiamondViewerProps } from './types/diamond-viewer';
import { motion } from 'framer-motion';

function getObjectTag(state: DiamondViewerState) {
  switch (state) {
    case 'wallet-connect':
    case 'wallet-connecting':
    case 'initial':
      return "https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/model-3d/diamond-pink.glb";
    case 'payment':
      return "https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/model-3d/diamond-blue.glb";
    case 'processing':
      return "https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/model-3d/diamond-blue.glb";
    case 'awaiting-confirmation':
      return "https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/model-3d/diamond-green.glb";
    case 'confirmed':
      return "https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/model-3d/diamond-green.glb";
    default:
      return "https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/model-3d/diamond-pink.glb";
  }
}

export function DiamondViewer({ state = 'initial', scale = 1.0 }: DiamondViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isLoaded, error } = useModelViewer(containerRef, getObjectTag(state));

  // Animation parameters based on state
  const getAnimationParams = (status: DiamondViewerState) => {
    switch (status) {
      case 'initial':
      case 'wallet-connect':
      case 'wallet-connecting':
        return {
          rotationSpeed: 1.0,
          intensity: 0.5,
          highlightIntensity: 2.0,
          exposure: 1.0,
          shadowSoftness: 1.0
        };
      case 'payment':
        return {
          rotationSpeed: 1.0,
          intensity: 0.6,
          highlightIntensity: 2.2,
          exposure: 1.1,
          shadowSoftness: 0.8
        };
      case 'processing':
        return {
          rotationSpeed: 2.0,
          intensity: 0.8,
          highlightIntensity: 2.5,
          exposure: 1.2,
          shadowSoftness: 0.5
        };
      case 'awaiting-confirmation':
        return {
          rotationSpeed: 1.0,
          intensity: 0.7,
          highlightIntensity: 2.3,
          exposure: 1.15,
          shadowSoftness: 0.7
        };
      case 'confirmed':
        return {
          rotationSpeed: 1.0,
          intensity: 0.9,
          highlightIntensity: 3.0,
          exposure: 1.3,
          shadowSoftness: 0.4
        };
      default:
        return {
          rotationSpeed: 1.0,
          intensity: 0.5,
          highlightIntensity: 2.0,
          exposure: 1.0,
          shadowSoftness: 1.0
        };
    }
  };

  // Update animation parameters when state changes
  useEffect(() => {
    if (!containerRef.current || !isLoaded) return;
    
    const modelViewer = containerRef.current.querySelector('model-viewer');
    if (!modelViewer) return;
    
    const params = getAnimationParams(state);
    
    // Apply parameters to the model viewer
    modelViewer.setAttribute('camera-orbit', `0deg 75deg 105%`);
    modelViewer.setAttribute('min-camera-orbit', `auto 0deg auto`);
    modelViewer.setAttribute('max-camera-orbit', `auto 180deg auto`);
    
    // Set auto-rotate
    if (params.rotationSpeed > 0) {
      modelViewer.setAttribute('auto-rotate', '');
      modelViewer.setAttribute('rotation-per-second', `${params.rotationSpeed}deg`);
    } else {
      modelViewer.removeAttribute('auto-rotate');
    }
    
    // Set lighting
    const envLight = modelViewer.querySelector('#envLight');
    if (envLight) {
      envLight.setAttribute('intensity', params.intensity.toString());
    }
    
    // Adjust other parameters
    modelViewer.setAttribute('shadow-intensity', params.shadowSoftness.toString());
    modelViewer.setAttribute('exposure', params.exposure.toString());
    
  }, [state, isLoaded]);

  return (
    <div ref={containerRef} className={`w-full h-full relative ${scale !== 1 ? 'transform scale-' + (scale * 100) : ''}`}>
      {error ? (
        <div className="w-full h-full flex items-center justify-center text-red-500">
          Erreur de chargement du modèle
        </div>
      ) : !isLoaded ? (
        <div className="w-full h-full flex items-center justify-center">
          <motion.div
            className="w-10 h-10 border-2 border-gray-300 border-t-primary rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      ) : null}
    </div>
  );
}

export default DiamondViewer;
