
import { Plus, Coins, Diamond, ArrowRight } from "lucide-react";
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
            className="relative flex justify-center items-center min-h-[400px] sm:min-h-[450px] md:min-h-[500px]"
          >
            {/* Effet de halo derrière l'iPhone */}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-200/20 via-blue-200/20 to-transparent rounded-full blur-3xl opacity-70" />
            
            {/* Container de l'iPhone avec effet de flottement */}
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotateY: [0, 2, 0],
                rotateX: [0, 1, 0]
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              className="relative w-[300px] sm:w-[320px] md:w-[340px] lg:w-[360px] xl:w-[380px] max-w-[35vw] min-w-[300px]"
            >
              {/* iPhone Frame */}
              <div className="relative rounded-[40px] bg-[#555555] p-[0.5px] shadow-2xl">
                {/* Effet titane mat */}
                <div className="absolute inset-0 rounded-[40px] bg-gradient-to-tr from-[#424242] via-[#4a4a4a] to-[#424242] opacity-90" />
                
                {/* Corps principal */}
                <div className="relative rounded-[40px] overflow-hidden">
                  {/* Dynamic Island */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120px] h-[8px] bg-black rounded-b-[20px] z-20" />
                  
                  {/* Écran */}
                  <div 
                    className="relative bg-white overflow-hidden" 
                    style={{ 
                      aspectRatio: '19.5/9',
                      borderRadius: '36px'
                    }}
                  >
                    {/* Contenu de l'écran avec bordures plus fines */}
                    <div className="absolute inset-[1px] bg-white rounded-[35px] overflow-hidden">
                      <div className="absolute inset-0 p-4 flex flex-col">
                        {/* En-tête de l'app */}
                        <div className="flex justify-between items-center mb-4">
                          <div className="space-y-0.5">
                            <h3 className="text-[13px] font-semibold">Transaction</h3>
                            <p className="text-[11px] text-gray-500">#TC-289345</p>
                          </div>
                          <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                            <Coins className="h-3.5 w-3.5 text-white" />
                          </div>
                        </div>

                        {/* Montant */}
                        <div className="text-center space-y-2 mb-4">
                          <p className="text-[12px] text-gray-600">Montant total</p>
                          <div className="text-lg font-bold">2.45 ETH</div>
                          <p className="text-[11px] text-gray-500">≈ 4,892.50 €</p>
                        </div>

                        {/* Indicateurs de sécurité */}
                        <div className="bg-gray-50 rounded-xl p-3 space-y-2.5">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <span className="text-[11px]">Transaction sécurisée</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                            <span className="text-[11px]">Protection acheteur</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-purple-500" />
                            <span className="text-[11px]">Garantie remboursement</span>
                          </div>
                        </div>

                        {/* Bouton de paiement */}
                        <div className="mt-auto">
                          <button className="w-full bg-black text-white rounded-xl py-2.5 text-[11px] font-medium">
                            Confirmer le paiement
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reflets et ombres */}
              <div className="absolute inset-0 rounded-[40px] pointer-events-none">
                {/* Effet titane brillant */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-white/10 to-white/5 mix-blend-overlay" />
                {/* Reflet latéral */}
                <div className="absolute inset-y-0 right-0 w-[20%] bg-gradient-to-l from-white/10 to-transparent" />
                {/* Reflet supérieur subtil */}
                <div className="absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-white/10 to-transparent opacity-50" />
                {/* Ombre portée plus naturelle */}
                <div className="absolute -bottom-10 -inset-x-4 h-16 bg-black/20 blur-2xl rounded-full" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
