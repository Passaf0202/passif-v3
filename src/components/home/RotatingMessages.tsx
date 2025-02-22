
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Circle } from "lucide-react";
import { Button } from "@/components/ui/button";

const MESSAGES = [
  "La marketplace de seconde main N°1 au monde avec paiement en cryptomonnaie !",
  "Bénéficiez d'un paiement ultra sécurisé, instantané et avec des frais minimes grâce à la technologie blockchain.",
  "En moyenne, deux fois moins cher que nos concurrents en raison de frais minimes liés à la blockchain.",
  "Des fonds sécurisés et bloqués à chaque transaction puis libérés au vendeur une fois que le produit est bien reçu par l'acheteur, afin d'éviter toute arnaque.",
  "Des transactions éclairs ne durant que quelques secondes en moyenne grâce à la technologie blockchain (2-5 secondes en moyenne)."
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

    // Nettoyer le timeout existant s'il y en a un
    if (autoplayResumeTimeout.current) {
      clearTimeout(autoplayResumeTimeout.current);
    }

    // Réactiver l'autoplay après le délai
    autoplayResumeTimeout.current = setTimeout(() => {
      setIsAutoPlaying(true);
    }, AUTOPLAY_RESUME_DELAY);
  };

  // Nettoyage du timeout lors du démontage du composant
  useEffect(() => {
    return () => {
      if (autoplayResumeTimeout.current) {
        clearTimeout(autoplayResumeTimeout.current);
      }
    };
  }, []);

  return (
    <div className="relative space-y-4">
      <div className="min-h-[100px] sm:min-h-[80px] flex items-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentIndex}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5 }}
            className="text-sm sm:text-base md:text-lg text-gray-700"
          >
            {MESSAGES[currentIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2">
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
