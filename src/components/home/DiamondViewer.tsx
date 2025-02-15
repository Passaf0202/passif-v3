
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { TransactionState } from "./HeroSection";
import { Suspense, useEffect, useState } from "react";

interface DiamondViewerProps {
  state: TransactionState;
}

function BasicCube({ state }: { state: TransactionState }) {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshPhongMaterial color={state === 'confirmed' ? '#22c55e' : '#6366f1'} />
    </mesh>
  );
}

function Scene({ state }: DiamondViewerProps) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <BasicCube state={state} />
      <OrbitControls 
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
}

export default function DiamondViewer({ state }: DiamondViewerProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Vérifier si WebGL est disponible
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setError('WebGL n\'est pas supporté par votre navigateur');
      }
    } catch (e) {
      setError('Erreur lors de l\'initialisation de WebGL');
    }
  }, []);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div style={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }>
          <Canvas
            camera={{ position: [0, 0, 3], fov: 75 }}
            style={{ width: '100%', height: '100%' }}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: 'high-performance'
            }}
          >
            <Scene state={state} />
          </Canvas>
        </Suspense>
      </div>
    </div>
  );
}
