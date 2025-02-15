
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

export type DiamondViewerState = 
  | 'initial'               
  | 'wallet-connect'        
  | 'wallet-connecting'     
  | 'payment'              
  | 'processing'           
  | 'awaiting-confirmation' 
  | 'confirmed';

interface DiamondViewerProps {
  state: DiamondViewerState;
}

export function DiamondViewer({ state }: DiamondViewerProps) {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 3] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls enableZoom={false} />
        <mesh>
          <boxGeometry />
          <meshStandardMaterial 
            color={
              state === 'confirmed' ? '#22c55e' : 
              state === 'processing' ? '#3b82f6' :
              state === 'awaiting-confirmation' ? '#eab308' :
              '#000000'
            } 
          />
        </mesh>
      </Canvas>
    </div>
  );
}

export default DiamondViewer;
