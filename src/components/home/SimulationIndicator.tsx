
import { motion } from "framer-motion";
import { MousePointer } from "lucide-react";

export function SimulationIndicator() {
  return (
    <motion.div
      initial={{ opacity: 1, x: 0, y: 0 }}
      animate={{ 
        x: [0, -5, 0],
        y: [0, -3, 0],
        scale: [1, 0.95, 1]
      }}
      transition={{ 
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="absolute right-[-8px] top-[50%] -translate-y-1/2 pointer-events-none z-50"
    >
      <MousePointer size={24} className="text-black fill-white" />
    </motion.div>
  );
}
