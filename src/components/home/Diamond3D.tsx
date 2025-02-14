
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group } from 'three';

export function Diamond3D() {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF('/models/diamond.glb');

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={1} position={[0, 0, 0]} />
    </group>
  );
}

useGLTF.preload('/models/diamond.glb');
