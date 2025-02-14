
import { Plus, Coins, Diamond, ArrowRight, MapPin, Star, Shield, MessageCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <div className="relative bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      {/* Cercles décoratifs d'arrière-plan */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/5 to-black/10 backdrop-blur-[1px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100/30 rounded-full transform translate-x-1/3 -translate-y-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100/30 rounded-full transform -translate-x-1/3 translate-y-1/3 blur-3xl" />
      </div>
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 lg:py-8 relative">
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

          {/* Colonne de droite - iPhone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative flex justify-center items-center min-h-[500px] sm:min-h-[550px] md:min-h-[600px]"
          >
            {/* Effet de halo derrière l'iPhone */}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-200/30 via-blue-200/30 to-transparent rounded-full blur-3xl opacity-70" />
            
            {/* Container de l'iPhone avec effet de flottement et perspective */}
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotateY: [-5, -3, -5],
                rotateX: [2, 3, 2]
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              className="relative w-[320px] sm:w-[340px] md:w-[360px] lg:w-[380px] xl:w-[400px] max-w-[40vw] min-w-[320px] transform perspective-1000"
              style={{ perspective: "1000px" }}
            >
              {/* iPhone Frame */}
              <div className="relative rounded-[40px] bg-[#1A1A1A] p-[1px] shadow-2xl">
                {/* Effet titane brossé */}
                <div className="absolute inset-0 rounded-[40px] bg-gradient-to-tr from-[#2a2a2a] via-[#3a3a3a] to-[#2a2a2a] opacity-90" />
                
                {/* Corps principal */}
                <div className="relative rounded-[40px] overflow-hidden">
                  {/* Dynamic Island */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[100px] h-[10px] bg-black rounded-b-[20px] z-20" />
                  
                  {/* Écran */}
                  <div 
                    className="relative bg-white overflow-hidden" 
                    style={{ 
                      aspectRatio: '19.5/9',
                      borderRadius: '36px'
                    }}
                  >
                    {/* Interface de l'app */}
                    <div className="absolute inset-[1px] bg-white rounded-[35px] overflow-hidden">
                      <div className="absolute inset-0 p-4 flex flex-col">
                        {/* En-tête */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                              <Star className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold">BMW Série 3</h3>
                              <p className="text-xs text-gray-500">320d Sport Line</p>
                            </div>
                          </div>
                          <button className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <Heart className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>

                        {/* Image du produit */}
                        <div className="relative aspect-video rounded-xl overflow-hidden mb-4">
                          <img
                            src="https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop&q=60"
                            alt="BMW Série 3"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>

                        {/* Prix et localisation */}
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="text-lg font-bold">0.85 ETH</div>
                            <div className="text-sm text-gray-500">≈ 24,500 €</div>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>Paris, FR</span>
                          </div>
                        </div>

                        {/* Badges de confiance */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <div className="flex items-center gap-2 bg-green-50 rounded-lg p-2">
                            <Shield className="h-4 w-4 text-green-600" />
                            <span className="text-xs text-green-700">Protection acheteur</span>
                          </div>
                          <div className="flex items-center gap-2 bg-blue-50 rounded-lg p-2">
                            <Star className="h-4 w-4 text-blue-600" />
                            <span className="text-xs text-blue-700">Vendeur vérifié</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-auto">
                          <button className="flex-1 bg-black text-white rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2">
                            <Coins className="h-4 w-4" />
                            Acheter en crypto
                          </button>
                          <button className="w-12 bg-gray-100 rounded-xl flex items-center justify-center">
                            <MessageCircle className="h-4 w-4 text-gray-700" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reflets et ombres */}
              <div className="absolute inset-0 rounded-[40px] pointer-events-none">
                {/* Effet de brillance */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-white/5 to-transparent opacity-80" />
                {/* Reflet latéral */}
                <div className="absolute inset-y-0 right-0 w-[30%] bg-gradient-to-l from-white/20 to-transparent" />
                {/* Reflet écran */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/5" />
                {/* Ombre portée */}
                <div className="absolute -bottom-10 -inset-x-8 h-20 bg-black/20 blur-2xl rounded-full" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
