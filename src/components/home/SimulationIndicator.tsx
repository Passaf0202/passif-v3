
import { motion } from "framer-motion";

export function SimulationIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.3 }}
      className="absolute left-0 top-1/2 -translate-x-16 -translate-y-12 pointer-events-none z-30"
    >
      <div className="relative">
        <svg
          width="120"
          height="80"
          viewBox="0 0 120 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transform scale-75 sm:scale-100"
        >
          <motion.path
            d="M10 10 Q 30 10, 50 30 T 90 50"
            stroke="black"
            strokeWidth="2"
            fill="transparent"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: 1, 
              opacity: 1,
              strokeDasharray: ["0 1", "1 0"]
            }}
            transition={{ 
              duration: 1.5,
              delay: 0.8,
              ease: "easeInOut"
            }}
          />
          <motion.path
            d="M82 45 L 90 50 L 85 40"
            stroke="black"
            strokeWidth="2"
            fill="transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          />
        </svg>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.3 }}
          className="absolute left-0 top-0 whitespace-nowrap"
        >
          <span className="text-xs sm:text-sm font-medium text-primary bg-white/80 px-2 py-1 rounded-full shadow-sm">
            Simulez une transaction
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}
