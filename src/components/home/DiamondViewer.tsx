
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Diamond3D } from './Diamond3D';
import { Suspense } from 'react';
import { Loader2 } from "lucide-react";

interface DiamondViewerProps {
  state: 'initial' | 'wallet-connect' | 'wallet-connecting' | 'search' | 'validating' | 'processing' | 'confirmed';
}

export function DiamondViewer({ state }: DiamondViewerProps) {
  return (
    <div className="w-[200px] h-[200px] relative">
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      }>
        <Canvas
          dpr={[1, 2]}
          gl={{ alpha: true, antialias: true }}
          camera={{ position: [0, 0, 4], fov: 50 }}
        >
          <color attach="background" args={['transparent']} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Diamond3D />
          <OrbitControls 
            enableZoom={false}
            enablePan={false}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}

export default DiamondViewer;
