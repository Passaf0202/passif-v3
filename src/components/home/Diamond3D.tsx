
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export function Diamond3D() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1, 1]} />
      <meshPhysicalMaterial
        color="#ffffff"
        metalness={0.9}
        roughness={0.1}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
      />
    </mesh>
  );
}
