
import { useEffect, useRef, useState } from 'react';
import React from 'react';
import { Canvas } from '@react-three/fiber';
import type { Mesh } from 'three';

const Diamond = ({ position, scale }: { position: [number, number, number]; scale: number }) => {
  const meshRef = useRef<Mesh>(null);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x = 0.5;
      meshRef.current.rotation.y = 0.5;
    }
  }, []);

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[scale, scale, scale]} />
      <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
    </mesh>
  );
};

const DiamondsScene = () => (
  <>
    <ambientLight intensity={0.5} />
    <directionalLight position={[10, 10, 5]} intensity={1} />
    {Array.from({ length: 15 }, (_, i) => {
      const position: [number, number, number] = [
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 5
      ];
      const scale = 0.5 + Math.random() * 1.5;
      return <Diamond key={i} position={position} scale={scale} />;
    })}
  </>
);

export function DiamondWall() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) {
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
