
import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group } from 'three';

// Spécifiez le chemin du dossier contenant le GLTF et ses ressources
const MODEL_PATH = 'https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/models';

export function Diamond3D() {
  const groupRef = useRef<Group>(null);
  const gltf = useGLTF(`${MODEL_PATH}/result.gltf`, true);

  useEffect(() => {
    console.log('Model loaded:', gltf);
    if (gltf.scene) {
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          console.log('Mesh found:', child);
        }
      });
    }
  }, [gltf]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.01;
    }
  });

  if (!gltf.scene) {
    return null;
  }

  return (
    <group ref={groupRef}>
      <primitive object={gltf.scene} scale={1} position={[0, 0, 0]} />
    </group>
  );
}

// Précharger le modèle
useGLTF.preload(`${MODEL_PATH}/result.gltf`);
