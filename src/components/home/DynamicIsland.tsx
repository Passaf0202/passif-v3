
import React from 'react';
import { motion } from 'framer-motion';

export const DynamicIsland = () => {
  return (
    <motion.div 
      className="dynamic-island dynamic-island-default"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-end h-full pr-4">
        <div className="w-2 h-2 rounded-full bg-white/20" />
      </div>
    </motion.div>
  );
};
