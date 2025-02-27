
import { useState, useEffect, MutableRefObject } from 'react';

interface ModelViewerHookResult {
  isLoaded: boolean;
  error: Error | null;
}

export function useModelViewer(
  containerRef: MutableRefObject<HTMLDivElement | null>,
  src: string
): ModelViewerHookResult {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const loadModelViewer = async () => {
      try {
        // Vérifier si model-viewer est déjà défini
        if (typeof window !== 'undefined' && !customElements.get('model-viewer')) {
          // Charger dynamiquement model-viewer si nécessaire
          const modelViewerScript = document.createElement('script');
          modelViewerScript.type = 'module';
          modelViewerScript.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.1.1/model-viewer.min.js';
          document.head.appendChild(modelViewerScript);

          await new Promise((resolve) => {
            modelViewerScript.onload = resolve;
          });
        }

        // Créer l'élément model-viewer
        if (containerRef.current) {
          // Vérifier si un model-viewer existe déjà
          let modelViewer = containerRef.current.querySelector('model-viewer');
          
          if (!modelViewer) {
            // Créer un nouvel élément model-viewer
            modelViewer = document.createElement('model-viewer');
            modelViewer.setAttribute('src', src);
            modelViewer.setAttribute('camera-controls', '');
            modelViewer.setAttribute('auto-rotate', '');
            modelViewer.setAttribute('ar', '');
            modelViewer.setAttribute('ar-modes', 'webxr scene-viewer quick-look');
            modelViewer.setAttribute('shadow-intensity', '1');
            modelViewer.setAttribute('camera-orbit', '0deg 75deg 105%');
            modelViewer.setAttribute('style', 'width: 100%; height: 100%; --poster-color: transparent; background-color: transparent;');
            
            // Ajouter les lumières
            const fragment = document.createDocumentFragment();
            const template = document.createElement('template');
            template.innerHTML = `
              <div class="environment" slot="environment">
                <light id="envLight" type="ambient" intensity="0.5"></light>
                <light type="directional" intensity="2.0"></light>
              </div>
            `;
            fragment.appendChild(template.content.cloneNode(true));
            modelViewer.appendChild(fragment);
            
            // Ajouter model-viewer au conteneur
            containerRef.current.appendChild(modelViewer);
            
            // Gérer les événements load/error
            modelViewer.addEventListener('load', () => {
              console.log('Model loaded successfully');
              setIsLoaded(true);
            });
            
            modelViewer.addEventListener('error', (e) => {
              console.error('Error loading model:', e);
              setError(new Error('Failed to load 3D model'));
            });
          } else {
            // Mettre à jour la source si le model-viewer existe déjà
            if (modelViewer.getAttribute('src') !== src) {
              setIsLoaded(false);
              modelViewer.setAttribute('src', src);
            }
          }
        }
      } catch (err) {
        console.error('Error in useModelViewer:', err);
        setError(err instanceof Error ? err : new Error('Unknown error in useModelViewer'));
      }
    };

    loadModelViewer();

    // Nettoyage
    return () => {
      // Pas besoin de nettoyer model-viewer car il sera géré par React
    };
  }, [containerRef, src]);

  return { isLoaded, error };
}
