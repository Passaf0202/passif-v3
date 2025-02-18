
import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </>
  );
}

export function DiamondWall() {
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="h-48 md:hidden bg-black">
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 4], fov: 50 }}>
        <Scene />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}
