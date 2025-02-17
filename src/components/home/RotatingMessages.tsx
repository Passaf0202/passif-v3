
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Circle } from "lucide-react";
import { HandDrawnCircle } from "./HandDrawnCircle";

const MESSAGES = [
  {
    text: "La marketplace de seconde main",
    highlight: "N°1",
    suffix: "au monde avec paiement en cryptomonnaie !"
  },
  {
    text: "Paiement ultra sécurisé, instantané et sans commission grâce à la",
    highlight: "blockchain",
    suffix: "."
  },
  {
    text: "",
    highlight: "Deux fois moins cher",
    suffix: "que nos concurrents."
  },
  {
    text: "Des fonds sécurisés sur un",
    highlight: "compte séquestre",
    suffix: "à chaque transaction."
  },
  {
    text: "Des transactions éclairs ne durant que",
    highlight: "quelques secondes",
    suffix: "."
  }
];

const ROTATION_INTERVAL = 6000;
const AUTOPLAY_RESUME_DELAY = 10000;

export function RotatingMessages() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoplayResumeTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % MESSAGES.length);
    }, ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleDotClick = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);

    if (autoplayResumeTimeout.current) {
      clearTimeout(autoplayResumeTimeout.current);
    }

    autoplayResumeTimeout.current = setTimeout(() => {
      setIsAutoPlaying(true);
    }, AUTOPLAY_RESUME_DELAY);
  };

  useEffect(() => {
    return () => {
      if (autoplayResumeTimeout.current) {
        clearTimeout(autoplayResumeTimeout.current);
      }
    };
  }, []);

  return (
    <div className="relative space-y-2">
      <div className="min-h-[80px] sm:min-h-[72px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentIndex}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.5 }}
            className="text-sm sm:text-base text-gray-700 text-center max-w-[300px] mx-auto leading-snug"
          >
            {MESSAGES[currentIndex].text && (
              <span>{MESSAGES[currentIndex].text}{" "}</span>
            )}
            {MESSAGES[currentIndex].highlight && (
              <HandDrawnCircle>
                {MESSAGES[currentIndex].highlight}
              </HandDrawnCircle>
            )}
            {MESSAGES[currentIndex].suffix && (
              <span>{" "}{MESSAGES[currentIndex].suffix}</span>
            )}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-1.5">
        {MESSAGES.map((_, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            className={`w-2 h-2 p-0 rounded-full transition-all duration-200 hover:opacity-100
              ${index === currentIndex ? 'bg-primary opacity-100 scale-125' : 'bg-primary/30 opacity-50 scale-100'}`}
            onClick={() => handleDotClick(index)}
          >
            <Circle className="w-2 h-2" />
            <span className="sr-only">Message {index + 1}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}

