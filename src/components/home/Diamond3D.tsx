
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group } from 'three';

export function Diamond3D({ state }: { state: 'initial' | 'wallet-connect' | 'wallet-connecting' | 'search' | 'validating' | 'processing' | 'confirmed' }) {
  const groupRef = useRef<Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Base rotation speed
      let rotationSpeed = 0.5;
      
      // Adjust rotation speed based on state
      if (state === 'processing') {
        rotationSpeed = 2;
      } else if (state === 'confirmed') {
        rotationSpeed = 0.3;
      }
      
      groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <mesh>
        {/* Temporary diamond geometry until we load the actual model */}
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
          color="#111111"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
}
