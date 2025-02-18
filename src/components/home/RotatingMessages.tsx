import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

type MessageSegment = {
  prefix?: string;
  highlight?: string;
  suffix?: string;
};

const MOBILE_MESSAGES: MessageSegment[] = [
  {
    highlight: "La marketplace de seconde main N°1",
    suffix: " au monde avec paiement en cryptomonnaie !"
  },
  {
    prefix: "Paiement ultra sécurisé, instantané et sans commission ",
    highlight: "grâce à la blockchain",
    suffix: "."
  },
  {
    prefix: "Des transactions sécurisés ",
    highlight: "sans commission",
    suffix: " à la différence de nos concurrents."
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

const DESKTOP_MESSAGES = [
  "La marketplace de seconde main N°1 au monde avec paiement en cryptomonnaie !",
  "Paiement ultra sécurisé, instantané et sans commission grâce à la blockchain.",
  "Des transactions sécurisés sans commission à la différence de nos concurrents.",
  "Des fonds sécurisés sur un compte séquestre à chaque transaction.",
  "Des transactions éclairs ne durant que quelques secondes grâce à la blockchain."
];

const ROTATION_INTERVAL = 6000;
const AUTOPLAY_RESUME_DELAY = 10000;

export function RotatingMessages() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoplayResumeTimeout = useRef<NodeJS.Timeout>();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % (isMobile ? MOBILE_MESSAGES.length : DESKTOP_MESSAGES.length));
    }, ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, [isAutoPlaying, isMobile]);

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

  const renderMessage = (message: MessageSegment | string) => {
    if (typeof message === 'string') {
      return message;
    }
    return (
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
  };

  const messages = isMobile ? MOBILE_MESSAGES : DESKTOP_MESSAGES;

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
            {renderMessage(messages[currentIndex])}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center md:justify-start gap-2">
        {messages.map((_, index) => (
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
