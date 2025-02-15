
import { Canvas } from "@react-three/fiber";
import { useRef } from "react";
import type { TransactionState } from "./HeroSection";

interface DiamondViewerProps {
  state: TransactionState;
}

const Diamond = ({ state }: { state: TransactionState }) => {
  const meshRef = useRef(null);

  return (
    <mesh ref={meshRef}>
      <boxGeometry />
      <meshBasicMaterial color={state === 'confirmed' ? '#22c55e' : '#6366f1'} />
    </mesh>
  );
};

export function DiamondViewer({ state }: DiamondViewerProps) {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight />
        <Diamond state={state} />
      </Canvas>
    </div>
  );
}
