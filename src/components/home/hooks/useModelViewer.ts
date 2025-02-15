
import { useState, useEffect, useRef, useCallback } from 'react';
import type { SyntheticEvent } from 'react';
import { DiamondViewerState } from '../types/diamond-viewer';

const MODEL_PATH = 'https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/models/Logo%20Tradecoiner%20-%203D.glb';
let modelViewerScriptLoaded = false;

export function useModelViewer(state: DiamondViewerState) {
  const [isModelViewerReady, setModelViewerReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [hasError, setHasError] = useState(false);
  const modelRef = useRef<HTMLElement>(null);
  const initializeAttempts = useRef(0);

  useEffect(() => {
    if (!modelViewerScriptLoaded) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js';
      script.onload = () => {
        console.log('Model Viewer script loaded successfully');
        modelViewerScriptLoaded = true;
        setModelViewerReady(true);
      };
      script.onerror = error => {
        console.error('Error loading Model Viewer script:', error);
        setHasError(true);
      };
      document.head.appendChild(script);
    } else {
      setModelViewerReady(true);
    }
  }, []);

  useEffect(() => {
    if (isModelViewerReady && initializeAttempts.current < 3) {
      const checkModelViewer = () => {
        if (customElements.get('model-viewer')) {
          console.log('Model Viewer component is ready');
          return true;
        }
        initializeAttempts.current++;
        return false;
      };

      const interval = setInterval(() => {
        if (checkModelViewer()) {
          clearInterval(interval);
        } else if (initializeAttempts.current >= 3) {
          clearInterval(interval);
          setHasError(true);
          console.error('Failed to initialize Model Viewer after 3 attempts');
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isModelViewerReady]);

  const handleError = useCallback((event: SyntheticEvent<HTMLElement, Event>) => {
    console.error('Model Viewer error:', event);
    setHasError(true);
    setIsLoading(false);
  }, []);

  const handleLoad = useCallback(() => {
    console.log('Model loaded successfully');
    setIsLoading(false);
    setLoadingProgress(100);
  }, []);

  const handleProgress = useCallback((event: CustomEvent) => {
    const progress = event.detail.totalProgress * 100;
    console.log('Loading progress:', progress);
    setLoadingProgress(Math.min(progress, 100));
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

  useEffect(() => {
    if (modelRef.current) {
      const modelViewer = modelRef.current;
      const preloadModel = async () => {
        try {
          const response = await fetch(MODEL_PATH);
          if (!response.ok) throw new Error('Failed to preload model');
          const blob = await response.blob();
          console.log('Model preloaded successfully');
        } catch (error) {
          console.error('Error preloading model:', error);
        }
      };
      preloadModel();
      modelViewer.addEventListener('error', handleError as any);
      modelViewer.addEventListener('load', handleLoad as any);
      modelViewer.addEventListener('progress', handleProgress as any);
      return () => {
        modelViewer.removeEventListener('error', handleError as any);
        modelViewer.removeEventListener('load', handleLoad as any);
        modelViewer.removeEventListener('progress', handleProgress as any);
      };
    }
  }, [handleError, handleLoad, handleProgress]);

  return {
    modelRef,
    isModelViewerReady,
    isLoading,
    loadingProgress,
    hasError,
    getRotationSpeed,
    MODEL_PATH
  };
}
