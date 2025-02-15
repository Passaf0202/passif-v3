
import { Canvas } from "@react-three/fiber";
import * as THREE from 'three';
import type { TransactionState } from "./HeroSection";

interface DiamondViewerProps {
  state: TransactionState;
}

function BasicCube({ state }: { state: TransactionState }) {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={state === 'confirmed' ? '#22c55e' : '#6366f1'} />
    </mesh>
  );
}

export default function DiamondViewer({ state }: DiamondViewerProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        gl={{ antialias: true }}
        camera={{
          fov: 75,
          near: 0.1,
          far: 1000,
          position: [0, 0, 3]
        }}
      >
        <color attach="background" args={['#ffffff']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <BasicCube state={state} />
      </Canvas>
    </div>
  );
}
