
import { Canvas } from "@react-three/fiber";
import { useRef } from "react";
import type { TransactionState } from "./HeroSection";
import * as THREE from "three";

interface DiamondViewerProps {
  state: TransactionState;
}

function Diamond({ state }: { state: TransactionState }) {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color={state === 'confirmed' ? '#22c55e' : '#6366f1'} 
      />
    </mesh>
  );
}

export function DiamondViewer({ state }: DiamondViewerProps) {
  return (
    <div className="w-full h-full">
      <Canvas>
        <ambientLight />
        <Diamond state={state} />
      </Canvas>
    </div>
  );
}
