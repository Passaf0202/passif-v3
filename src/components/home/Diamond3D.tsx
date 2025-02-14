
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group } from 'three';

const MODEL_URL = 'https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/models/result.gltf';

export function Diamond3D() {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF(MODEL_URL);

  // Ensure scene is loaded
  if (!scene) {
    return null;
  }

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

// Pre-load the model
useGLTF.preload(MODEL_URL);
