
import { Plus, Coins, Diamond, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export function HeroSection() {
  return (
    <div className="relative bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      {/* Arrière-plan décoratif */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/5 to-black/10 backdrop-blur-[1px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-black/5 rounded-full transform translate-x-1/3 -translate-y-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/5 rounded-full transform -translate-x-1/3 translate-y-1/3 blur-3xl" />
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

          {/* Colonne de droite - Nouvelle Illustration en Noir et Blanc */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative flex justify-center items-center"
          >
            {/* Container des trois rectangles avec effet de superposition */}
            <div className="relative w-full max-w-md aspect-square">
              {/* Rectangle 1 - Montre Connectée */}
              <motion.div
                animate={{ 
                  y: [0, -5, 0],
                  rotate: [-2, 0, -2]
                }}
                transition={{ 
                  duration: 6,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
                className="absolute top-[15%] left-[10%] w-[45%] aspect-square bg-white rounded-lg shadow-sm border border-black/10 overflow-hidden"
              >
                <div className="relative w-full h-full p-4">
                  {/* Continuous Line Art de la montre */}
                  <motion.svg
                    viewBox="0 0 100 100"
                    className="w-full h-full"
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.path
                      d="M30 50 C30 30, 70 30, 70 50 C70 70, 30 70, 30 50"
                      stroke="black"
                      strokeWidth="1"
                      fill="none"
                      variants={{
                        hidden: { pathLength: 0 },
                        visible: { 
                          pathLength: 1,
                          transition: { duration: 2, ease: "easeInOut" }
                        }
                      }}
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="15"
                      stroke="black"
                      strokeWidth="0.5"
                      fill="none"
                    />
                  </motion.svg>
                </div>
              </motion.div>

              {/* Rectangle 2 - Smartphone (Plus grand et centré) */}
              <motion.div
                animate={{ 
                  y: [0, -8, 0],
                  rotate: [2, 0, 2]
                }}
                transition={{ 
                  duration: 7,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                  delay: 0.2
                }}
                className="absolute top-[25%] left-[25%] w-[50%] aspect-[3/4] bg-white rounded-lg shadow-md border border-black/10 z-10"
              >
                <div className="relative w-full h-full p-4">
                  {/* Interface UI minimaliste */}
                  <motion.svg
                    viewBox="0 0 100 140"
                    className="w-full h-full"
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.rect
                      x="20"
                      y="20"
                      width="60"
                      height="100"
                      rx="8"
                      stroke="black"
                      strokeWidth="1"
                      fill="none"
                      variants={{
                        hidden: { pathLength: 0 },
                        visible: { 
                          pathLength: 1,
                          transition: { duration: 2, ease: "easeInOut" }
                        }
                      }}
                    />
                    {/* Détails de l'interface */}
                    <motion.path
                      d="M30 40 L70 40 M30 60 L70 60 M30 80 L70 80"
                      stroke="black"
                      strokeWidth="0.5"
                      strokeDasharray="2 2"
                      variants={{
                        hidden: { pathLength: 0 },
                        visible: { 
                          pathLength: 1,
                          transition: { duration: 1.5, delay: 0.5 }
                        }
                      }}
                    />
                  </motion.svg>
                </div>
              </motion.div>

              {/* Rectangle 3 - Écouteurs Wireless */}
              <motion.div
                animate={{ 
                  y: [0, -3, 0],
                  rotate: [-1, 1, -1]
                }}
                transition={{ 
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                  delay: 0.4
                }}
                className="absolute top-[35%] right-[10%] w-[45%] aspect-square bg-white rounded-lg shadow-sm border border-black/10"
              >
                <div className="relative w-full h-full p-4">
                  {/* Écouteurs en Line Art */}
                  <motion.svg
                    viewBox="0 0 100 100"
                    className="w-full h-full"
                    initial="hidden"
                    animate="visible"
                  >
                    {/* Écouteur gauche */}
                    <motion.path
                      d="M30 50 C30 40, 40 30, 50 30 C60 30, 70 40, 70 50"
                      stroke="black"
                      strokeWidth="1"
                      fill="none"
                      variants={{
                        hidden: { pathLength: 0 },
                        visible: { 
                          pathLength: 1,
                          transition: { duration: 2, ease: "easeInOut" }
                        }
                      }}
                    />
                    {/* Ondes sonores stylisées */}
                    <motion.path
                      d="M40 60 C45 60, 45 55, 50 55 M50 65 C55 65, 55 60, 60 60"
                      stroke="black"
                      strokeWidth="0.5"
                      strokeDasharray="2 2"
                      variants={{
                        hidden: { pathLength: 0 },
                        visible: { 
                          pathLength: 1,
                          transition: { duration: 1.5, delay: 0.5 }
                        }
                      }}
                    />
                  </motion.svg>
                </div>
              </motion.div>

              {/* Particules d'ornement */}
              <AnimatePresence>
                {[...Array(10)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0.5, 1, 0.5],
                      x: [0, (Math.random() - 0.5) * 100],
                      y: [0, (Math.random() - 0.5) * 100],
                    }}
                    transition={{
                      duration: 4,
                      delay: i * 0.2,
                      repeat: Infinity,
                      repeatType: "loop",
                    }}
                    style={{
                      left: `${50 + (Math.random() - 0.5) * 50}%`,
                      top: `${50 + (Math.random() - 0.5) * 50}%`,
                    }}
                  >
                    <div className="w-1 h-1 bg-black/10 rounded-full" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
