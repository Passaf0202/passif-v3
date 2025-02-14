
import { Canvas } from '@react-three/fiber';
import { Diamond3D } from './Diamond3D';
import { Suspense, Component, ReactNode } from 'react';
import { Loader2 } from "lucide-react";

interface DiamondViewerProps {
  state: 'initial' | 'wallet-connect' | 'wallet-connecting' | 'search' | 'validating' | 'processing' | 'confirmed';
}

class ErrorBoundary extends Component<{
  children: ReactNode;
  fallback: ReactNode;
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

export function DiamondViewer({ state }: DiamondViewerProps) {
  return (
    <div className="w-[200px] h-[200px] relative">
      <ErrorBoundary fallback={
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-sm text-gray-500">Unable to load 3D viewer</span>
        </div>
      }>
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        }>
          <Canvas 
            camera={{ 
              position: [0, 0, 4],
              fov: 50
            }}
            style={{ background: 'transparent' }}
          >
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <Diamond3D />
          </Canvas>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

export default DiamondViewer;
