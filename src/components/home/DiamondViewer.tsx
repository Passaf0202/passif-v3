
import { Canvas } from '@react-three/fiber';
import { Diamond3D } from './Diamond3D';
import { useEffect, useState } from 'react';

export function DiamondViewer({ state }: { state: 'initial' | 'wallet-connect' | 'wallet-connecting' | 'search' | 'validating' | 'processing' | 'confirmed' }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="w-[200px] h-[200px]">
      <Canvas
        dpr={[1, 2]}
        camera={{
          fov: 45,
          near: 0.1,
          far: 1000,
          position: [0, 0, 5]
        }}
      >
        <color attach="background" args={['transparent']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Diamond3D />
      </Canvas>
    </div>
  );
}
