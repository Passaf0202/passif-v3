
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group } from 'three';
import { toast } from '@/components/ui/use-toast';

const MODEL_PATH = 'https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/models/Logo%20Tradecoiner%20-%203D.glb';

export function Diamond3D() {
  const groupRef = useRef<Group>(null);
  const [error, setError] = useState(false);

  const { scene } = useGLTF(MODEL_PATH, undefined, undefined, (error) => {
    console.error('Error loading model:', error);
    setError(true);
    toast({
      variant: "destructive",
      title: "Error loading 3D model",
      description: "Please try refreshing the page",
    });
  });

  useFrame(() => {
    if (groupRef.current && !error) {
      groupRef.current.rotation.y += 0.01;
    }
  });

  if (error) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" wireframe />
      </mesh>
    );
  }

  if (!scene) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="gray" wireframe />
      </mesh>
    );
  }

  return (
    <group ref={groupRef}>
      <primitive 
        object={scene} 
        scale={0.5} 
        position={[0, -0.5, 0]}
        rotation={[0, 0, 0]} 
      />
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
