
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const SimulationIndicator = () => {
  const [shouldShow, setShouldShow] = useState(true);

  // Cacher après 5 secondes
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldShow(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  if (!shouldShow) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="absolute top-[-30px] left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/70 text-white text-[10px] rounded-full whitespace-nowrap z-50"
    >
      <div className="flex items-center">
        <span className="mr-1.5">Cliquez pour simuler</span>
        <motion.div 
          className="h-1.5 w-1.5 rounded-full bg-green-400"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut"
          }}
        />
      </div>
    </motion.div>
  );
};
