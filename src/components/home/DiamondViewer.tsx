
import { Canvas } from "@react-three/fiber";
import type { TransactionState } from "./HeroSection";

interface DiamondViewerProps {
  state: TransactionState;
}

function BasicCube({ state }: { state: TransactionState }) {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color={state === 'confirmed' ? '#22c55e' : '#6366f1'} />
    </mesh>
  );
}

export function DiamondViewer({ state }: DiamondViewerProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{
          fov: 75,
          position: [0, 0, 3]
        }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <BasicCube state={state} />
      </Canvas>
    </div>
  );
}
