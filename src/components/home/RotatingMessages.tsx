
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Circle } from "lucide-react";
import { Button } from "@/components/ui/button";

type MessageSegment = {
  prefix?: string;
  highlight?: string;
  suffix?: string;
};

const MESSAGES: MessageSegment[] = [
  {
    highlight: "La marketplace de seconde main N°1",
    suffix: " au monde avec paiement en cryptomonnaie !"
  },
  {
    prefix: "Paiement ultra sécurisé, instantané et sans commission."
  },
  {
    prefix: "En moyenne, ",
    highlight: "deux fois moins cher",
    suffix: " que nos concurrents."
  },
  {
    prefix: "Des fonds sécurisés ",
    highlight: "sur un compte séquestre",
    suffix: " à chaque transaction."
  },
  {
    prefix: "Des transactions éclairs ne durant ",
    highlight: "que quelques secondes",
    suffix: " grâce à la blockchain."
  }
];

const ROTATION_INTERVAL = 6000; // 6 secondes
const AUTOPLAY_RESUME_DELAY = 10000; // 10 secondes

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

  const renderMessage = (message: MessageSegment) => (
    <>
      {message.prefix}
      {message.highlight && (
        <span className="relative inline-block px-1 bg-[#CDCDCD] text-black" style={{
          transform: "skew(-12deg)",
          display: "inline-block",
        }}>
          <span style={{ display: "inline-block", transform: "skew(12deg)" }} className="font-semibold">
            {message.highlight}
          </span>
        </span>
      )}
      {message.suffix}
    </>
  );

  return (
    <div className="relative space-y-1">
      <div className="min-h-[60px] sm:min-h-[80px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentIndex}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5 }}
            className="text-sm sm:text-base md:text-lg text-gray-700 text-center md:text-left w-full px-4 md:px-0"
          >
            {renderMessage(MESSAGES[currentIndex])}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center md:justify-start gap-1">
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
