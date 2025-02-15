
import { motion } from "framer-motion";
import { MousePointer } from "lucide-react";

export function SimulationIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="absolute right-[-12px] top-1/2 -translate-y-1/2 pointer-events-none z-50"
    >
      <div className="bg-white/80 rounded-full p-1">
        <MousePointer size={20} className="text-primary" />
      </div>
    </motion.div>
  );
}
