
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { Diamond3D } from './Diamond3D';

interface DiamondViewerProps {
  state: 'initial' | 'wallet-connect' | 'wallet-connecting' | 'search' | 'validating' | 'processing' | 'confirmed';
}

export function DiamondViewer({ state }: DiamondViewerProps) {
  return (
    <div style={{ width: '200px', height: '200px' }}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['transparent']} />
        <ambientLight intensity={0.5} />
        <Diamond3D />
        <OrbitControls enableZoom={false} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}

export default DiamondViewer;
