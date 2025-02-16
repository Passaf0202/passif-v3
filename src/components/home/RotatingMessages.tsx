
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const messages = [
  "La marketplace de seconde main N°1 au monde avec paiement en cryptomonnaie !",
  "Bénéficiez d'un paiement ultra sécurisé, instantané et avec des frais minimes grâce à la technologie blockchain.",
  "En moyenne, deux fois moins cher que nos concurrents en raison de frais minimes liés à la blockchain.",
  "Des fonds sécurisés et bloqués à chaque transaction puis libérés au vendeur une fois que le produit est bien reçu par l'acheteur, afin d'éviter toute arnaque.",
  "Des transactions éclairs ne durant que quelques secondes en moyenne grâce à la technologie blockchain (2-5 secondes en moyenne)."
];

const variants = {
  enter: { opacity: 0, y: 20 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export function RotatingMessages() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative">
      <div className="relative h-24 sm:h-28 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentIndex}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5 }}
            className="absolute inset-0 text-sm sm:text-base md:text-lg text-gray-600 max-w-xl"
          >
            {messages[currentIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="flex gap-2 justify-start mt-4">
        {messages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              currentIndex === index ? 'bg-primary' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
