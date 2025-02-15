
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import type { TransactionState } from "./HeroSection";
import * as THREE from "three";

interface DiamondViewerProps {
  state: TransactionState;
}

function Diamond({ state }: { state: TransactionState }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.rotation.x += delta * 0.2;
    }
  });

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.color = new THREE.Color(
        state === 'confirmed' ? '#22c55e' : '#6366f1'
      );
    }
  }, [state]);

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
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        style={{ background: 'transparent' }}
        camera={{ position: [0, 0, 4], fov: 25 }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[2.5, 8, 5]}
          intensity={1.5}
          castShadow
        />
        <Diamond state={state} />
      </Canvas>
    </div>
  );
}
