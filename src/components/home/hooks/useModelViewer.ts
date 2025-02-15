
import { useState, useEffect, useRef, useCallback } from 'react';
import type { SyntheticEvent } from 'react';
import { DiamondViewerState } from '../types/diamond-viewer';

const MODEL_PATH = 'https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/models/Logo%20Tradecoiner%20-%203D.glb';
let modelViewerScriptLoaded = false;

const FAST_SPEED = "90deg";
const NORMAL_SPEED = "8deg";
const TRANSITION_DURATION = 1500;

export function useModelViewer(state: DiamondViewerState) {
  const [isModelViewerReady, setModelViewerReady] = useState(false);
  const [isSpinningFast, setIsSpinningFast] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(NORMAL_SPEED);
  const modelRef = useRef<HTMLElement>(null);
  const spinTimeout = useRef<NodeJS.Timeout>();
  const previousStateRef = useRef<DiamondViewerState>(state);

  const getRotationSpeed = useCallback(() => {
    return currentSpeed;
  }, [currentSpeed]);

  useEffect(() => {
    if (state === 'confirmed' && previousStateRef.current !== 'confirmed') {
      setIsSpinningFast(true);
      setCurrentSpeed(FAST_SPEED);
      
      if (spinTimeout.current) {
        clearTimeout(spinTimeout.current);
      }
      
      // Transition progressive vers la vitesse normale
      spinTimeout.current = setTimeout(() => {
        setIsSpinningFast(false);
        setCurrentSpeed(NORMAL_SPEED);
      }, TRANSITION_DURATION);
    }

    previousStateRef.current = state;

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

  return {
    modelRef,
    isModelViewerReady,
    getRotationSpeed,
    MODEL_PATH
  };
}
