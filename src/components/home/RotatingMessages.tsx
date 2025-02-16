
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const MESSAGES = [
  "La marketplace de seconde main N°1 au monde avec paiement en cryptomonnaie !",
  "Bénéficiez d'un paiement ultra sécurisé, instantané et avec des frais minimes grâce à la technologie blockchain.",
  "En moyenne, deux fois moins cher que nos concurrents en raison de frais minimes liés à la blockchain.",
  "Des fonds sécurisés et bloqués à chaque transaction puis libérés au vendeur une fois que le produit est bien reçu par l'acheteur, afin d'éviter toute arnaque.",
  "Des transactions éclairs ne durant que quelques secondes en moyenne grâce à la technologie blockchain (2-5 secondes en moyenne)."
];

const ROTATION_INTERVAL = 6000; // 6 secondes

export function RotatingMessages() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % MESSAGES.length);
    }, ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + MESSAGES.length) % MESSAGES.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % MESSAGES.length);
  };

  return (
    <div className="relative">
      <div className="min-h-[100px] sm:min-h-[80px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-sm sm:text-base md:text-lg text-gray-700 text-center max-w-2xl mx-auto px-4"
          >
            {MESSAGES[currentIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-2 mt-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={handlePrevious}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={handleNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
