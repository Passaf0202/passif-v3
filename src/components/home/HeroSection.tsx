
import { Plus, Coins, Diamond, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export function HeroSection() {
  return (
    <div className="relative bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      {/* Cercles décoratifs d'arrière-plan */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/5 to-black/10 backdrop-blur-[1px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100/30 rounded-full transform translate-x-1/3 -translate-y-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100/30 rounded-full transform -translate-x-1/3 translate-y-1/3 blur-3xl" />
      </div>
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-8 lg:py-12 relative">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-12 items-center">
          {/* Colonne de gauche - Texte */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-3 sm:space-y-4 md:space-y-6"
          >
            <div className="inline-flex items-center gap-2 bg-white/90 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full shadow-sm">
              <Diamond className="h-3 w-3 sm:h-4 sm:w-4 text-black" />
              <span className="text-xs sm:text-sm font-medium">La marketplace crypto #1 en France</span>
            </div>
            
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">
              Achetez et vendez avec
              <span className="text-black"> crypto</span>
              <br /> en toute confiance
            </h1>
            
            <p className="text-sm sm:text-base md:text-lg text-gray-600">
              TRADECOINER révolutionne les transactions en ligne en combinant la sécurité de la blockchain avec la simplicité d'une marketplace moderne.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Link to="/create">
                <Button 
                  size="default"
                  className="group text-xs sm:text-sm md:text-base h-8 sm:h-10 md:h-12 px-3 sm:px-4 md:px-6 bg-black hover:bg-black/90 w-full sm:w-auto"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Déposer une annonce
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-2 opacity-0 group-hover:opacity-100 transition-all" />
                </Button>
              </Link>
              <Link to="/search">
                <Button 
                  variant="outline" 
                  size="default"
                  className="group text-xs sm:text-sm md:text-base h-8 sm:h-10 md:h-12 px-3 sm:px-4 md:px-6 border-2 border-black text-black hover:bg-black/5 w-full sm:w-auto"
                >
                  <Coins className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Explorer les annonces
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-3 sm:pt-4">
              <div className="text-center">
                <div className="font-bold text-base sm:text-lg md:text-xl lg:text-2xl text-black">100K+</div>
                <div className="text-xs sm:text-sm text-gray-600">Utilisateurs actifs</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-base sm:text-lg md:text-xl lg:text-2xl text-black">50K+</div>
                <div className="text-xs sm:text-sm text-gray-600">Annonces publiées</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-base sm:text-lg md:text-xl lg:text-2xl text-black">24/7</div>
                <div className="text-xs sm:text-sm text-gray-600">Support client</div>
              </div>
            </div>
          </motion.div>

          {/* Colonne de droite - Nouvelle Illustration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative flex justify-center items-center"
          >
            {/* Effet de halo derrière l'illustration */}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-200/30 via-blue-200/30 to-transparent rounded-full blur-2xl" />
            
            {/* Container de l'illustration avec effet de flottement */}
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 1, 0]
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              className="relative w-[300px] h-[300px]"
            >
              {/* Continuous Line Art Hand */}
              <motion.svg
                viewBox="0 0 100 100"
                className="w-full h-full absolute"
                initial="hidden"
                animate="visible"
              >
                {/* Tracé progressif de la main */}
                <motion.path
                  d="M50 70 C45 70, 40 65, 40 60 L40 45 C40 42, 42 40, 45 40 L48 40 C50 40, 52 42, 52 45 L52 55 M52 55 L52 65 C52 68, 54 70, 57 70 L60 70"
                  stroke="url(#gradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                  variants={{
                    hidden: { pathLength: 0 },
                    visible: { 
                      pathLength: 1,
                      transition: { 
                        duration: 2,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatDelay: 3
                      }
                    }
                  }}
                />
                
                {/* Dégradé pour la ligne */}
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#000000" />
                    <stop offset="50%" stopColor="#333333" />
                    <stop offset="100%" stopColor="#000000" />
                  </linearGradient>
                </defs>
              </motion.svg>

              {/* Point de contact lumineux */}
              <motion.div
                className="absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.8, 0.2, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                <div className="w-full h-full bg-gradient-to-r from-purple-500/50 to-blue-500/50 rounded-full blur-md" />
              </motion.div>

              {/* Spirale de diamants */}
              <AnimatePresence>
                {[...Array(16)].map((_, i) => {
                  const angle = (i * Math.PI * 2) / 16;
                  const radius = 80;
                  const delay = i * 0.1;
                  
                  return (
                    <motion.div
                      key={i}
                      className="absolute top-1/2 left-1/2"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        scale: [0, 1, 0.8],
                        opacity: [0, 1, 0],
                        x: [0, Math.cos(angle) * radius * Math.sin(i / 3)],
                        y: [0, Math.sin(angle) * radius * Math.cos(i / 3)],
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 3,
                        delay: delay,
                        repeat: Infinity,
                        repeatDelay: 1,
                      }}
                    >
                      <div className="relative">
                        <Diamond
                          className="text-black transform -translate-x-1/2 -translate-y-1/2"
                          size={24 - (i % 3) * 4}
                          strokeWidth={1}
                        />
                        {/* Traînée derrière le diamant */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-transparent"
                          style={{
                            clipPath: "polygon(0 0, 100% 50%, 0 100%)",
                            width: "20px",
                            height: "2px",
                            transform: "translateX(-100%)",
                          }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Particules d'étoiles */}
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={`sparkle-${i}`}
                  className="absolute"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.5, 1, 0.5],
                    x: [
                      0,
                      (Math.random() - 0.5) * 200,
                      (Math.random() - 0.5) * 300,
                    ],
                    y: [
                      0,
                      (Math.random() - 0.5) * 200,
                      (Math.random() - 0.5) * 300,
                    ],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <Sparkles
                    className="text-black/30"
                    size={8 + (i % 3) * 4}
                  />
                </motion.div>
              ))}

              {/* Ondes concentriques */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={`wave-${i}`}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/10"
                  initial={{ width: 20, height: 20, opacity: 0.8 }}
                  animate={{
                    width: [20, 200],
                    height: [20, 200],
                    opacity: [0.8, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.4,
                    repeat: Infinity,
                    repeatDelay: 0.5,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
