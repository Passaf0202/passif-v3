
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { Diamond3D } from './Diamond3D';
import { Suspense } from 'react';
import { motion } from 'framer-motion';

interface DiamondViewerProps {
  state: 'initial' | 'wallet-connect' | 'wallet-connecting' | 'search' | 'validating' | 'processing' | 'confirmed';
}

export function DiamondViewer({ state }: DiamondViewerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full"
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <Suspense fallback={null}>
          <Diamond3D state={state} />
          <Environment preset="city" />
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={2}
          />
        </Suspense>
      </Canvas>
    </motion.div>
  );
}
