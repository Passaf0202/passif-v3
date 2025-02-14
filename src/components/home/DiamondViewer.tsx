
import { Canvas } from '@react-three/fiber';
import { Diamond3D } from './Diamond3D';
import { Suspense } from 'react';

interface DiamondViewerProps {
  state: 'initial' | 'wallet-connect' | 'wallet-connecting' | 'search' | 'validating' | 'processing' | 'confirmed';
}

export function DiamondViewer({ state }: DiamondViewerProps) {
  return (
    <div className="w-[200px] h-[200px]">
      <Canvas 
        frameloop="demand"
        camera={{ 
          position: [0, 0, 4],
          fov: 50
        }}
      >
        <Suspense fallback={null}>
          <ambientLight />
          <Diamond3D />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default DiamondViewer;
