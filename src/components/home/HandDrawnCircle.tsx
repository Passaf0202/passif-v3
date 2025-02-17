
import { motion } from "framer-motion";

interface HandDrawnCircleProps {
  children: React.ReactNode;
  isMobile?: boolean;
}

export const HandDrawnCircle = ({ children, isMobile }: HandDrawnCircleProps) => {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative inline-flex items-center justify-center px-1"
    >
      <span className="relative z-10">{children}</span>
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full -z-0"
        initial={{ pathLength: 0, rotate: -5 }}
        animate={{ pathLength: 1, rotate: 0 }}
        transition={{ duration: 1, ease: "easeInOut" }}
      >
        {isMobile ? (
          <motion.path
            d="M25,50 
            C25,35 35,25 50,25
            S75,35 75,50
            S65,75 50,75
            S25,65 25,50
            C25,50 25,50 25,50"
            className="fill-none stroke-[#000000]"
            strokeWidth={2}
            strokeLinecap="round"
            style={{
              filter: "url(#handDrawn)",
              strokeDasharray: "0.8 0.3",
              strokeDashoffset: "0.5"
            }}
          />
        ) : (
          <motion.path
            d="M20,50 a30,30 0 1,1 60,0 a30,30 0 1,1 -60,0"
            className="fill-none stroke-[#000000] stroke-[1.5]"
            strokeLinecap="round"
            style={{
              filter: "url(#rough)"
            }}
          />
        )}
        <defs>
          {isMobile ? (
            <filter id="handDrawn">
              <feTurbulence baseFrequency="0.15" seed="0" type="fractalNoise" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="1" />
            </filter>
          ) : (
            <filter id="rough">
              <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" />
              <feDisplacementMap in="SourceGraphic" scale="1.5" />
            </filter>
          )}
        </defs>
      </motion.svg>
    </motion.span>
  );
};
