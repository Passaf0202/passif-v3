
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { TransactionState } from "./HeroSection";
import { Suspense } from "react";

interface DiamondViewerProps {
  state: TransactionState;
}

function BasicCube({ state }: { state: TransactionState }) {
  return (
    <mesh>
      <boxGeometry />
      <meshPhongMaterial color={state === 'confirmed' ? '#22c55e' : '#6366f1'} />
    </mesh>
  );
}

export default function DiamondViewer({ state }: DiamondViewerProps) {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Suspense fallback={null}>
        <Canvas>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <BasicCube state={state} />
          <OrbitControls 
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 2}
            maxPolarAngle={Math.PI / 2}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
