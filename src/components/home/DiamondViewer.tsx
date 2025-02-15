
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { TransactionState } from "./HeroSection";
import * as THREE from "three";

interface DiamondViewerProps {
  state: TransactionState;
}

function Diamond({ state }: { state: TransactionState }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.rotation.x += delta * 0.2;
    }
  });

  // Update material color based on state
  if (materialRef.current) {
    materialRef.current.color = new THREE.Color(
      state === 'confirmed' ? '#22c55e' : '#6366f1'
    );
  }

  return (
    <mesh
      ref={meshRef}
      castShadow
      receiveShadow
      scale={1}
    >
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial
        ref={materialRef}
        color={state === 'confirmed' ? '#22c55e' : '#6366f1'}
        metalness={0.8}
        roughness={0.1}
        envMapIntensity={2.5}
      />
    </mesh>
  );
}

export function DiamondViewer({ state }: DiamondViewerProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0, 4], fov: 25 }}
      gl={{ alpha: true, antialias: true }}
      className="rounded-xl"
    >
      <color attach="background" args={['transparent']} />
      <ambientLight intensity={0.5} />
      <directionalLight
        castShadow
        position={[2.5, 8, 5]}
        intensity={1.5}
        shadow-mapSize={1024}
        shadow-bias={-0.0004}
      />
      <Diamond state={state} />
    </Canvas>
  );
}
