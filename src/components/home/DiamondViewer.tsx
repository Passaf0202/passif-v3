
import { Canvas } from '@react-three/fiber';
import { Diamond3D } from './Diamond3D';
import { Suspense } from 'react';
import { Loader2 } from "lucide-react";

interface DiamondViewerProps {
  state: 'initial' | 'wallet-connect' | 'wallet-connecting' | 'search' | 'validating' | 'processing' | 'confirmed';
}

export function DiamondViewer({ state }: DiamondViewerProps) {
  return (
    <div className="w-[200px] h-[200px]">
      <ErrorBoundary fallback={
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-sm text-gray-500">Unable to load 3D viewer</span>
        </div>
      }>
        <Canvas 
          camera={{ 
            position: [0, 0, 4],
            fov: 50
          }}
        >
          <ambientLight intensity={0.5} />
          <Diamond3D />
        </Canvas>
      </ErrorBoundary>
    </div>
  );
}

// Composant ErrorBoundary simple pour gérer les erreurs de rendu
class ErrorBoundary extends React.Component<{
  children: React.ReactNode;
  fallback: React.ReactNode;
}> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default DiamondViewer;
