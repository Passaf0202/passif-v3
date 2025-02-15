
import { motion } from "framer-motion";
import { MousePointer } from "lucide-react";

export function SimulationIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="absolute -right-6 top-1/2 -translate-y-1/2 pointer-events-none z-30"
    >
      <MousePointer size={16} className="text-primary" />
    </motion.div>
  );
}
