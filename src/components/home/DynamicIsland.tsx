
import { motion } from "framer-motion";

export function DynamicIsland() {
  return (
    <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-[126px] h-[34px] z-30 pointer-events-none">
      <motion.div 
        className="w-full h-full mobile-dynamic-island rounded-[25px] flex items-center justify-center overflow-hidden"
        initial={{ width: 126, height: 34 }}
        animate={{ width: 126, height: 34 }}
        transition={{ 
          duration: 0.5, 
          type: "spring",
          stiffness: 200, 
          damping: 25
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-black/5" />
      </motion.div>
    </div>
  );
}
