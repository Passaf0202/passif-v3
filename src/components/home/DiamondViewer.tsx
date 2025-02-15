import { Canvas } from "@react-three/fiber";
import { motion } from "framer-motion";
import type { TransactionState } from "./HeroSection";

interface DiamondViewerProps {
  state: TransactionState;
}

export function DiamondViewer({ state }: DiamondViewerProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0, 4], fov: 25 }}
      gl={{ alpha: true, antialias: true }}
      className="rounded-xl"
    >
      <color attach="background" args={['transparent']} />
      <ambientLight intensity={0.5} />
      <directionalLight
        castShadow
        position={[2.5, 8, 5]}
        intensity={1.5}
        shadow-mapSize={1024}
        shadow-bias={-0.0004}
      />
      <motion.mesh
        castShadow
        receiveShadow
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
        }}
      >
        <sphereGeometry args={[1, 64, 64]} />
        <motion.meshStandardMaterial
          color="#6366f1"
          metalness={0.8}
          roughness={0.1}
          envMapIntensity={2.5}
          animate={{
            color: state === 'confirmed' ? '#22c55e' : '#6366f1',
          }}
          transition={{ duration: 0.5 }}
        />
      </motion.mesh>
    </Canvas>
  );
}
