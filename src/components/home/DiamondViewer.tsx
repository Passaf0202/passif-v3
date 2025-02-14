
import { Canvas } from '@react-three/fiber';
import { Diamond3D } from './Diamond3D';

export function DiamondViewer({ state }: { state: 'initial' | 'wallet-connect' | 'wallet-connecting' | 'search' | 'validating' | 'processing' | 'confirmed' }) {
  return (
    <div className="w-full h-full">
      <Canvas>
        <ambientLight />
        <Diamond3D />
      </Canvas>
    </div>
  );
}
