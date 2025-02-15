
import { useState, useEffect, useRef, useCallback } from 'react';
import type { SyntheticEvent } from 'react';
import { DiamondViewerState } from '../types/diamond-viewer';

const MODEL_PATH = 'https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/models/Logo%20Tradecoiner%20-%203D.glb';
let modelViewerScriptLoaded = false;

const NORMAL_SPEED = "8deg";
const MEDIUM_SPEED = "30deg";
const FAST_SPEED = "60deg";

// Durées de transition pour chaque étape
const ACCELERATION_DURATION = 300;
const PEAK_DURATION = 700;
const DECELERATION_DURATION = 500;
const TOTAL_DURATION = ACCELERATION_DURATION * 2 + PEAK_DURATION + DECELERATION_DURATION;

export function useModelViewer(state: DiamondViewerState) {
  const [isModelViewerReady, setModelViewerReady] = useState(false);
  const [isSpinningFast, setIsSpinningFast] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(NORMAL_SPEED);
  const modelRef = useRef<HTMLElement>(null);
  const spinTimeouts = useRef<NodeJS.Timeout[]>([]);
  const previousStateRef = useRef<DiamondViewerState>(state);

  const getRotationSpeed = useCallback(() => {
    return currentSpeed;
  }, [currentSpeed]);

  const clearAllTimeouts = () => {
    spinTimeouts.current.forEach(timeout => clearTimeout(timeout));
    spinTimeouts.current = [];
  };

  useEffect(() => {
    if (state === 'confirmed' && previousStateRef.current !== 'confirmed') {
      setIsSpinningFast(true);
      clearAllTimeouts();

      // Première transition : Normal -> Medium
      setCurrentSpeed(MEDIUM_SPEED);

      // Deuxième transition : Medium -> Fast
      const toFastTimeout = setTimeout(() => {
        setCurrentSpeed(FAST_SPEED);
      }, ACCELERATION_DURATION);
      spinTimeouts.current.push(toFastTimeout);

      // Troisième transition : Fast -> Medium
      const toMediumTimeout = setTimeout(() => {
        setCurrentSpeed(MEDIUM_SPEED);
      }, ACCELERATION_DURATION + PEAK_DURATION);
      spinTimeouts.current.push(toMediumTimeout);

      // Dernière transition : Medium -> Normal
      const toNormalTimeout = setTimeout(() => {
        setCurrentSpeed(NORMAL_SPEED);
        setIsSpinningFast(false);
      }, TOTAL_DURATION);
      spinTimeouts.current.push(toNormalTimeout);
    }

    previousStateRef.current = state;

    return () => {
      clearAllTimeouts();
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
