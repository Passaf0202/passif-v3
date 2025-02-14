
import { Canvas } from '@react-three/fiber';
import { Diamond3D } from './Diamond3D';

interface DiamondViewerProps {
  state: 'initial' | 'wallet-connect' | 'wallet-connecting' | 'search' | 'validating' | 'processing' | 'confirmed';
}

export function DiamondViewer({ state }: DiamondViewerProps) {
  return (
    <div style={{ width: '200px', height: '200px' }}>
      <Canvas
        camera={{ position: [0, 0, 4] }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Diamond3D />
      </Canvas>
    </div>
  );
}

export default DiamondViewer;
