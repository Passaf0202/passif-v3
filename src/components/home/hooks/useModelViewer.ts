import { useState, useEffect, useRef } from 'react';
import { DiamondViewerState } from '../types/diamond-viewer';

const MODEL_PATH = 'https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/models/Logo%20Tradecoiner%20-%203D.glb';
let modelViewerScriptLoaded = false;

export function useModelViewer(state: DiamondViewerState) {
  const [isModelViewerReady, setModelViewerReady] = useState(false);
  const modelRef = useRef<HTMLElement>(null);

  // Load model-viewer script if not loaded
  useEffect(() => {
    if (!modelViewerScriptLoaded) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js';
      script.onload = () => {
        modelViewerScriptLoaded = true;
        setModelViewerReady(true);
      };
      script.onerror = (error) => {
        console.error('Error loading model-viewer script:', error);
      };
      document.head.appendChild(script);
    } else {
      setModelViewerReady(true);
    }

    return () => {
      // No need to clean up the script on unmount as we want to keep it loaded
    };
  }, []);

  return {
    modelRef,
    isModelViewerReady,
    MODEL_PATH
  };
}
