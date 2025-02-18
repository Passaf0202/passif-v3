
import React from 'react';
import { Canvas } from '@react-three/fiber';

function Box() {
  return (
    <mesh>
      <boxGeometry />
      <meshNormalMaterial />
    </mesh>
  );
}

export function DiamondWall() {
  return (
    <div className="h-48 md:hidden bg-black">
      <Canvas>
        <Box />
      </Canvas>
    </div>
  );
}
