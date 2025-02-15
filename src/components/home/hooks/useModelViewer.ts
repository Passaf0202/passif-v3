
import { useState, useEffect, useRef, useCallback } from 'react';
import type { SyntheticEvent } from 'react';
import { DiamondViewerState } from '../types/diamond-viewer';

const MODEL_PATH = 'https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/models/Logo%20Tradecoiner%20-%203D.glb';
let modelViewerScriptLoaded = false;

export function useModelViewer(state: DiamondViewerState) {
  const [isModelViewerReady, setModelViewerReady] = useState(false);
  const modelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!modelViewerScriptLoaded) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js';
      script.onload = () => {
        modelViewerScriptLoaded = true;
        setModelViewerReady(true);
      };
      document.head.appendChild(script);
    } else {
      setModelViewerReady(true);
    }
  }, []);

  const getRotationSpeed = useCallback(() => {
    switch (state) {
      case 'wallet-connect':
        return "8deg";
      case 'wallet-connecting':
        return "4deg";
      case 'payment':
        return "12deg";
      case 'processing':
        return "4deg";
      case 'awaiting-confirmation':
        return "6deg";
      case 'confirmed':
        return "16deg";
      default:
        return "8deg";
    }
  }, [state]);

  return {
    modelRef,
    isModelViewerReady,
    getRotationSpeed,
    MODEL_PATH
  };
}
