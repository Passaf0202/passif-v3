
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
      <Canvas>
        <color attach="background" args={['transparent']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Suspense fallback={null}>
          <Diamond3D />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default DiamondViewer;
