
import { motion } from "framer-motion";
import type { TransactionState } from "./HeroSection";

interface DiamondViewerProps {
  state: TransactionState;
}

export default function DiamondViewer({ state }: DiamondViewerProps) {
  const color = state === 'confirmed' ? '#22c55e' : '#6366f1';
  
  return (
    <div className="w-full h-full flex items-center justify-center">
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ 
          rotate: 360,
          scale: state === 'confirmed' ? [1, 1.1, 1] : 1
        }}
        transition={{ 
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          scale: { duration: 0.5, ease: "easeInOut" }
        }}
        style={{
          width: '100%',
          maxWidth: '150px',
          filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.1))'
        }}
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          style={{ width: '100%', height: '100%' }}
        >
          {/* Définition des gradients pour l'effet 3D */}
          <defs>
            <linearGradient id="frontGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={`${color}`} stopOpacity="1" />
              <stop offset="100%" stopColor={`${color}`} stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="rightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={`${color}`} stopOpacity="0.9" />
              <stop offset="100%" stopColor={`${color}`} stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="topGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={`${color}`} stopOpacity="1" />
              <stop offset="100%" stopColor={`${color}`} stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {/* Face supérieure */}
          <motion.path
            d="M50 20 L80 35 L50 50 L20 35 Z"
            fill="url(#topGradient)"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          />

          {/* Face droite */}
          <motion.path
            d="M80 35 L80 65 L50 80 L50 50 Z"
            fill="url(#rightGradient)"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />

          {/* Face gauche */}
          <motion.path
            d="M20 35 L50 50 L50 80 L20 65 Z"
            fill="url(#frontGradient)"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          />

          {/* Effet de brillance */}
          <motion.circle
            cx="30"
            cy="30"
            r="3"
            fill="white"
            opacity="0.6"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.6, 0],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        </svg>
      </motion.div>
    </div>
  );
}
