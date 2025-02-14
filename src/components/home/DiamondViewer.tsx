
import { Canvas } from '@react-three/fiber';
import { Diamond3D } from './Diamond3D';
import { Suspense } from 'react';
import { Environment, OrbitControls } from '@react-three/drei';

interface DiamondViewerProps {
  state: 'initial' | 'wallet-connect' | 'wallet-connecting' | 'search' | 'validating' | 'processing' | 'confirmed';
}

export function DiamondViewer({ state }: DiamondViewerProps) {
  return (
    <div className="w-[200px] h-[200px]">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <color attach="background" args={['transparent']} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        <Suspense fallback={
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="gray" wireframe />
          </mesh>
        }>
          <Diamond3D />
          <OrbitControls enableZoom={false} />
          <Environment preset="city" background={false} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default DiamondViewer;
