
import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Créer une géométrie de base pour le fallback
const FallbackDiamond = ({ position, scale }: { position: [number, number, number]; scale: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += 0.01;
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <octahedronGeometry args={[1]} />
      <meshStandardMaterial color="#fff" metalness={0.8} roughness={0.2} />
    </mesh>
  );
};

const Diamond = ({ position, scale }: { position: [number, number, number]; scale: number }) => {
  const meshRef = useRef<THREE.Group>(null);
  let gltf;
  
  try {
    gltf = useGLTF('/models/diamond.glb');
  } catch (error) {
    console.error("Failed to load diamond model:", error);
    return <FallbackDiamond position={position} scale={scale} />;
  }

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += 0.01;
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
  });

  if (!gltf?.scene) {
    return <FallbackDiamond position={position} scale={scale} />;
  }

  return (
    <primitive
      ref={meshRef}
      object={gltf.scene.clone()}
      position={position}
      scale={[scale, scale, scale]}
    />
  );
};

const DiamondsScene = () => {
  const diamonds = Array.from({ length: 15 }, (_, i) => ({
    position: [
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 5,
      (Math.random() - 0.5) * 5
    ] as [number, number, number],
    scale: 0.5 + Math.random() * 1.5
  }));

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      {diamonds.map((diamond, i) => (
        <Diamond key={i} position={diamond.position} scale={diamond.scale} />
      ))}
    </>
  );
};

export function DiamondWall() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!loaded) {
    return <div className="h-48 md:hidden bg-black" />;
  }

  return (
    <div className="h-48 md:hidden bg-black">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <DiamondsScene />
      </Canvas>
    </div>
  );
}
