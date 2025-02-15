
import { motion } from "framer-motion";
import { MousePointer } from "lucide-react";

export function SimulationIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20, y: -10 }}
      animate={{ 
        opacity: [0, 1, 1, 1, 0],
        x: [20, 0, 0, 0, 20],
        y: [-10, 0, -5, 0, -10],
        scale: [1, 1, 0.9, 1, 1]
      }}
      transition={{ 
        duration: 2,
        repeat: Infinity,
        repeatDelay: 1,
        times: [0, 0.3, 0.5, 0.7, 1],
        ease: "easeInOut"
      }}
      className="absolute right-[-12px] top-1/2 -translate-y-1/2 pointer-events-none z-50"
    >
      <div className="bg-white/80 rounded-full p-1">
        <MousePointer size={20} className="text-primary" />
      </div>
    </motion.div>
  );
}
