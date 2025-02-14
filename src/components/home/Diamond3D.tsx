
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

export function Diamond3D({ state }: { state: 'initial' | 'wallet-connect' | 'wallet-connecting' | 'search' | 'validating' | 'processing' | 'confirmed' }) {
  const meshRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      // Base rotation speed
      let rotationSpeed = 0.5;
      
      // Adjust rotation speed based on state
      if (state === 'processing') {
        rotationSpeed = 2;
      } else if (state === 'confirmed') {
        rotationSpeed = 0.3;
      }
      
      meshRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial 
        color="#111111"
        metalness={0.9}
        roughness={0.1}
      />
    </mesh>
  );
}
