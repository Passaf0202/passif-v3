
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group } from 'three';

export function Diamond3D() {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF('https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/models/result.gltf');

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

// Pre-charge le modèle pour de meilleures performances
useGLTF.preload('https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/models/result.gltf');
