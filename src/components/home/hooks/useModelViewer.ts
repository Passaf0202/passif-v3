
import { useState, useEffect, useRef, useCallback } from 'react';
import type { SyntheticEvent } from 'react';
import { DiamondViewerState } from '../types/diamond-viewer';

const MODEL_PATH = 'https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/models/Logo%20Tradecoiner%20-%203D.glb';
let modelViewerScriptLoaded = false;

export function useModelViewer(state: DiamondViewerState) {
  const [isModelViewerReady, setModelViewerReady] = useState(false);
  const [isSpinningFast, setIsSpinningFast] = useState(false);
  const modelRef = useRef<HTMLElement>(null);
  const spinTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Déclencher la rotation rapide quand l'état passe à 'confirmed'
    if (state === 'confirmed' && !isSpinningFast) {
      setIsSpinningFast(true);
      
      // Nettoyer tout timeout existant
      if (spinTimeout.current) {
        clearTimeout(spinTimeout.current);
      }
      
      // Revenir à la vitesse normale après 1 seconde
      spinTimeout.current = setTimeout(() => {
        setIsSpinningFast(false);
      }, 1000);
    }

    // Nettoyage du timeout lors du démontage
    return () => {
      if (spinTimeout.current) {
        clearTimeout(spinTimeout.current);
      }
    };
  }, [state]);

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
    if (isSpinningFast) {
      return "90deg";
    }
    return "8deg";
  }, [isSpinningFast]);

  return {
    modelRef,
    isModelViewerReady,
    getRotationSpeed,
    MODEL_PATH
  };
}
