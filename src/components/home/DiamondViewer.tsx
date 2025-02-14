
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
        shadows
        gl={{ antialias: true }}
        camera={{
          fov: 45,
          near: 0.1,
          far: 1000,
          position: [0, 0, 5]
        }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={['transparent']} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Diamond3D />
        </Suspense>
      </Canvas>
    </div>
  );
}
