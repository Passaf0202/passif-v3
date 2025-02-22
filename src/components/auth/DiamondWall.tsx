
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ErrorBoundary } from 'react-error-boundary';

function Box() {
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry attach="geometry" />
      <meshBasicMaterial attach="material" color="white" />
    </mesh>
  );
}

function Fallback() {
  return <div className="h-48 md:hidden bg-black" />;
}

function ErrorFallback() {
  return <div className="h-48 md:hidden bg-black" />;
}

export function DiamondWall() {
  return (
    <div className="h-48 md:hidden bg-black">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<Fallback />}>
          <Canvas gl={{ preserveDrawingBuffer: true }}>
            <Box />
          </Canvas>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
