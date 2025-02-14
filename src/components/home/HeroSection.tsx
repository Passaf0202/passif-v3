
import { Plus, Coins, Diamond, ArrowRight, MapPin, Star, Shield, MessageCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <div className="relative bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      {/* Cercles décoratifs d'arrière-plan améliorés */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-50/20 via-blue-50/20 to-gray-50/20 backdrop-blur-[1px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-200/40 to-blue-100/40 rounded-full transform translate-x-1/3 -translate-y-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-200/40 to-purple-100/40 rounded-full transform -translate-x-1/3 translate-y-1/3 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent)] pointer-events-none" />
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

          {/* Colonne de droite - iPhone Premium */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative flex justify-center items-center min-h-[500px] sm:min-h-[550px] md:min-h-[600px]"
          >
            {/* Effet de halo premium */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-200/30 via-blue-200/30 to-transparent rounded-full blur-3xl opacity-70" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.1),transparent_70%)]" />
            </div>
            
            {/* Container de l'iPhone avec effet de flottement et perspective */}
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotateY: [-3, -1, -3],
                rotateX: [2, 3, 2]
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              className="relative w-[320px] sm:w-[340px] md:w-[360px] lg:w-[380px] xl:w-[400px] max-w-[40vw] min-w-[320px] transform perspective-[2000px]"
              style={{ 
                perspective: "2000px",
                transformStyle: "preserve-3d"
              }}
            >
              {/* iPhone Frame - Design Titane */}
              <div className="relative rounded-[45px] bg-gradient-to-br from-[#2a2a2a] via-[#1a1a1a] to-[#2a2a2a] p-[1.5px] shadow-[0_0_30px_rgba(0,0,0,0.15),inset_0_0_1px_rgba(255,255,255,0.1)]">
                {/* Effet titane premium */}
                <div className="absolute inset-0 rounded-[45px] overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,0.2)_50%,transparent_75%)] bg-[length:200%_200%] animate-shimmer" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#2a2a2a] via-[#3a3a3a] to-[#2a2a2a] opacity-80" />
                </div>
                
                {/* Corps principal avec ombre interne */}
                <div className="relative rounded-[45px] overflow-hidden bg-black shadow-[inset_0_0_30px_rgba(0,0,0,0.3)]">
                  {/* Dynamic Island Premium */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[100px] h-[12px] bg-black rounded-b-[22px] z-20">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#333] to-transparent opacity-20" />
                  </div>
                  
                  {/* Écran avec effet de profondeur */}
                  <div 
                    className="relative bg-gradient-to-b from-[#fafafa] to-white overflow-hidden shadow-[inset_0_0_1px_rgba(0,0,0,0.1)]" 
                    style={{ 
                      aspectRatio: '19.5/9',
                      borderRadius: '42px'
                    }}
                  >
                    {/* Effet de brillance d'écran */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-[0.02] pointer-events-none" />
                    
                    {/* Interface de l'app */}
                    <div className="absolute inset-[1px] bg-white rounded-[41px] overflow-hidden">
                      <div className="absolute inset-0 p-4 flex flex-col">
                        {/* En-tête premium */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                              <Star className="h-4 w-4 text-white drop-shadow-sm" />
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-gray-900">Tesla Model 3</h3>
                              <p className="text-xs text-gray-500">Performance</p>
                            </div>
                          </div>
                          <button className="h-8 w-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors">
                            <Heart className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>

                        {/* Image du produit avec effet premium */}
                        <div className="relative aspect-video rounded-xl overflow-hidden mb-4 shadow-lg">
                          <img
                            src="https://images.unsplash.com/photo-1677051425502-03f1c25f8942?w=800&auto=format&fit=crop&q=60"
                            alt="Tesla Model 3"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent" />
                          <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md rounded-full px-2 py-1 text-[10px] text-white font-medium">
                            Premium
                          </div>
                        </div>

                        {/* Prix et localisation avec style premium */}
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                              12.5 ETH
                            </div>
                            <div className="text-sm text-gray-500">≈ 35,000 €</div>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded-full">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="text-xs">Monaco, MC</span>
                          </div>
                        </div>

                        {/* Badges de confiance premium */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-2 border border-green-100/50">
                            <Shield className="h-4 w-4 text-green-600" />
                            <span className="text-xs font-medium text-green-700">Protection Premium</span>
                          </div>
                          <div className="flex items-center gap-2 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-2 border border-purple-100/50">
                            <Diamond className="h-4 w-4 text-purple-600" />
                            <span className="text-xs font-medium text-purple-700">Vendeur Elite</span>
                          </div>
                        </div>

                        {/* Actions premium */}
                        <div className="flex gap-2 mt-auto">
                          <button className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 transition-all">
                            <Coins className="h-4 w-4" />
                            Acheter en crypto
                          </button>
                          <button className="w-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors">
                            <MessageCircle className="h-4 w-4 text-gray-700" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Effets premium avancés */}
              <div className="absolute inset-0 rounded-[45px] pointer-events-none">
                {/* Effet de brillance premium */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-white/5 to-transparent opacity-80" />
                {/* Reflet latéral subtil */}
                <div className="absolute inset-y-0 right-0 w-[40%] bg-gradient-to-l from-white/20 via-white/10 to-transparent" />
                {/* Reflet écran premium */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/10" />
                {/* Ombre portée améliorée */}
                <div className="absolute -bottom-10 -inset-x-8 h-20 bg-black/20 blur-2xl rounded-[100%]" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
