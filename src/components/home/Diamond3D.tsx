
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group } from 'three';
import { toast } from '@/components/ui/use-toast';

// Using a simple cube mesh if model is not available
export function Diamond3D() {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color="#4F46E5"
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
    </group>
  );
}
