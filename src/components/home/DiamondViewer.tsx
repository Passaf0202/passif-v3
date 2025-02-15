
import { Canvas, extend } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { BoxGeometry, MeshStandardMaterial } from "three";
import type { TransactionState } from "./HeroSection";

// Extend permet d'enregistrer les composants Three.js pour React Three Fiber
extend({ BoxGeometry, MeshStandardMaterial });

interface DiamondViewerProps {
  state: TransactionState;
}

function BasicCube({ state }: { state: TransactionState }) {
  return (
    <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
      <boxGeometry attach="geometry" args={[1, 1, 1]} />
      <meshStandardMaterial 
        attach="material"
        color={state === 'confirmed' ? '#22c55e' : '#6366f1'}
      />
    </mesh>
  );
}

export default function DiamondViewer({ state }: DiamondViewerProps) {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{
          position: [0, 0, 3],
          fov: 75
        }}
      >
        <color attach="background" args={['#ffffff']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <BasicCube state={state} />
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}
