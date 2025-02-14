import { Plus, Coins, Diamond, ArrowRight, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <div className="relative bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-50/20 via-blue-50/20 to-gray-50/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-200/40 to-blue-100/40 rounded-full transform translate-x-1/3 -translate-y-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-200/40 to-purple-100/40 rounded-full transform -translate-x-1/3 translate-y-1/3 blur-3xl" />
      </div>
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 lg:py-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4 md:space-y-6 lg:space-y-8"
          >
            <div className="inline-flex items-center gap-2 bg-white/90 px-3 py-1.5 rounded-full shadow-sm">
              <Diamond className="h-4 w-4 text-black" />
              <span className="text-sm font-medium">La marketplace crypto #1 en France</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Achetez et vendez avec
              <span className="text-black"> crypto</span>
              <br /> en toute confiance
            </h1>
            
            <p className="text-base sm:text-lg text-gray-600 max-w-xl">
              TRADECOINER révolutionne les transactions en ligne en combinant la sécurité de la blockchain avec la simplicité d'une marketplace moderne.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/create">
                <Button 
                  size="lg"
                  className="group w-full sm:w-auto bg-black hover:bg-black/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Déposer une annonce
                  <ArrowRight className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-all" />
                </Button>
              </Link>
              <Link to="/search">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="group w-full sm:w-auto border-2 border-black text-black hover:bg-black/5"
                >
                  <Coins className="h-4 w-4 mr-2" />
                  Explorer les annonces
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-4">
              <div className="text-center">
                <div className="font-bold text-xl sm:text-2xl text-black">100K+</div>
                <div className="text-sm text-gray-600">Utilisateurs actifs</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-xl sm:text-2xl text-black">50K+</div>
                <div className="text-sm text-gray-600">Annonces publiées</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-xl sm:text-2xl text-black">24/7</div>
                <div className="text-sm text-gray-600">Support client</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative mx-auto lg:ml-auto w-full max-w-[400px]"
          >
            <div className="absolute inset-0 scale-110">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-200/30 via-blue-200/30 to-transparent rounded-full blur-3xl opacity-70" />
            </div>
            
            <motion.div
              animate={{ 
                y: [0, -8, 0],
                rotateY: [-2, 0, -2],
                rotateX: [1, 2, 1]
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              className="relative w-full"
              style={{ 
                transformStyle: "preserve-3d",
                perspective: "1000px"
              }}
            >
              <div className="relative rounded-[55px] bg-black p-4 shadow-xl">
                <div className="relative bg-white rounded-[45px] overflow-hidden shadow-inner">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[95px] h-[35px] bg-black rounded-b-[18px] z-20" />
                  <div className="relative" style={{ aspectRatio: "9/19.5" }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-[90%] bg-white rounded-3xl p-4 shadow-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-8 w-8 rounded-full bg-violet-500 flex items-center justify-center">
                            <Star className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">Tesla Model 3</h3>
                            <p className="text-xs text-gray-500">Performance</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <div className="text-lg font-bold text-violet-600">12.5 ETH</div>
                            <div className="text-sm text-gray-500">≈ 35,000 €</div>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span className="text-xs">Monaco, MC</span>
                          </div>
                        </div>
                        <div className="flex gap-2 text-xs">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
                            Protection Premium
                          </span>
                          <span className="px-2 py-1 bg-violet-100 text-violet-700 rounded-full">
                            Vendeur Elite
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 rounded-[55px] pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-black/5 to-transparent opacity-50" />
                <div className="absolute -bottom-10 -inset-x-4 h-20 bg-black/20 blur-2xl rounded-full" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
