
import { motion } from "framer-motion";
import { Hand } from "lucide-react";

export function SimulationIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.3 }}
      className="absolute left-0 top-1/2 -translate-x-16 -translate-y-4 pointer-events-none z-30"
    >
      <div className="relative flex items-center gap-2">
        <motion.div
          initial={{ x: 10 }}
          animate={{ x: 0 }}
          transition={{
            repeat: Infinity,
            duration: 1,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        >
          <Hand size={24} className="text-primary transform -rotate-45" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="whitespace-nowrap"
        >
          <span className="text-xs sm:text-sm font-medium text-primary bg-white/90 px-2 py-1 rounded-full shadow-sm border border-primary/10">
            Clique et simule une transaction
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}
