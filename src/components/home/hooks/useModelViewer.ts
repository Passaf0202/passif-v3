
import { useState, useEffect, useRef, useCallback } from 'react';
import { DiamondViewerState } from '../types/diamond-viewer';

const MODEL_PATH = 'https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/models/Logo%20Tradecoiner%20-%203D.glb';
let modelViewerScriptLoaded = false;

// Rotation speeds
const NORMAL_SPEED = "8deg";
const MEDIUM_SPEED = "45deg";
const FAST_SPEED = "120deg";
const SUPER_FAST_SPEED = "360deg";

// Adjusted durations for better animation feel
const INITIAL_ACCELERATION = 200; // ms
const TO_SUPER_FAST = 300; // ms
const PEAK_DURATION = 500; // ms
const DECELERATION = 1000; // ms
const TOTAL_DURATION = INITIAL_ACCELERATION + TO_SUPER_FAST + PEAK_DURATION + DECELERATION;

export function useModelViewer(state: DiamondViewerState) {
  const [isModelViewerReady, setModelViewerReady] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(NORMAL_SPEED);
  const modelRef = useRef<HTMLElement>(null);
  const spinTimeouts = useRef<NodeJS.Timeout[]>([]);
  const previousStateRef = useRef<DiamondViewerState>(state);

  const getRotationSpeed = useCallback(() => {
    return currentSpeed;
  }, [currentSpeed]);

  const clearAllTimeouts = () => {
    if (Array.isArray(spinTimeouts.current)) {
      spinTimeouts.current.forEach(timeout => clearTimeout(timeout));
      spinTimeouts.current = [];
    }
  };

  // Only allow manual rotation through click/touch, not on hover
  useEffect(() => {
    if (modelRef.current && isModelViewerReady) {
      // Disable auto-rotation until clicked
      const viewer = modelRef.current;
      
      // Add click handler to manage interactions
      const handleClick = () => {
        // This is intentionally left empty to allow default model-viewer camera controls
        // while preventing other unwanted behaviors
      };

      viewer.addEventListener('click', handleClick);
      
      return () => {
        viewer.removeEventListener('click', handleClick);
      };
    }
  }, [isModelViewerReady]);

  // Handle animation state changes
  useEffect(() => {
    if (state === 'confirmed' && previousStateRef.current !== 'confirmed') {
      clearAllTimeouts();

      // First transition: Normal -> Medium
      setCurrentSpeed(MEDIUM_SPEED);

      // Second transition: Medium -> Fast
      const toFastTimeout = setTimeout(() => {
        setCurrentSpeed(FAST_SPEED);
      }, INITIAL_ACCELERATION);
      spinTimeouts.current.push(toFastTimeout);

      // Third transition: Fast -> SUPER_FAST
      const toSuperFastTimeout = setTimeout(() => {
        setCurrentSpeed(SUPER_FAST_SPEED);
      }, INITIAL_ACCELERATION + TO_SUPER_FAST);
      spinTimeouts.current.push(toSuperFastTimeout);

      // Fourth transition: SUPER_FAST -> Fast
      const backToFastTimeout = setTimeout(() => {
        setCurrentSpeed(FAST_SPEED);
      }, INITIAL_ACCELERATION + TO_SUPER_FAST + PEAK_DURATION);
      spinTimeouts.current.push(backToFastTimeout);

      // Fifth transition: Fast -> Medium
      const backToMediumTimeout = setTimeout(() => {
        setCurrentSpeed(MEDIUM_SPEED);
      }, INITIAL_ACCELERATION + TO_SUPER_FAST + PEAK_DURATION + DECELERATION / 2);
      spinTimeouts.current.push(backToMediumTimeout);

      // Last transition: Medium -> Normal
      const toNormalTimeout = setTimeout(() => {
        setCurrentSpeed(NORMAL_SPEED);
      }, TOTAL_DURATION);
      spinTimeouts.current.push(toNormalTimeout);
    }

    previousStateRef.current = state;

    return () => {
      clearAllTimeouts();
    };
  }, [state]);

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
      document.head.appendChild(script);
    } else {
      setModelViewerReady(true);
    }

    return () => {
      clearAllTimeouts();
    };
  }, []);

  return {
    modelRef,
    isModelViewerReady,
    getRotationSpeed,
    MODEL_PATH
  };
}
