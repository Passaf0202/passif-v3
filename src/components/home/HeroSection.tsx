
import { Plus, Coins, Diamond, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <div className="relative bg-gradient-to-br from-gray-50 to-white overflow-hidden min-h-[calc(100vh-96px)]">
      {/* Cercles décoratifs d'arrière-plan */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/5 to-black/10 backdrop-blur-[1px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100/30 rounded-full transform translate-x-1/3 -translate-y-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100/30 rounded-full transform -translate-x-1/3 translate-y-1/3 blur-3xl" />
      </div>
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-8 sm:py-12 md:py-16 lg:py-24 relative">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-12 items-center">
          {/* Colonne de gauche - Texte */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4 sm:space-y-6 md:space-y-8"
          >
            <div className="inline-flex items-center gap-2 bg-white/90 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full shadow-sm">
              <Diamond className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
              <span className="text-xs sm:text-sm font-medium">La marketplace crypto #1 en France</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
              Achetez et vendez avec
              <span className="text-black"> crypto</span>
              <br /> en toute confiance
            </h1>
            
            <p className="text-sm sm:text-base md:text-lg xl:text-xl text-gray-600">
              TRADECOINER révolutionne les transactions en ligne en combinant la sécurité de la blockchain avec la simplicité d'une marketplace moderne.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Link to="/create">
                <Button 
                  size="default"
                  className="group text-sm sm:text-base h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 bg-black hover:bg-black/90 w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Déposer une annonce
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2 opacity-0 group-hover:opacity-100 transition-all" />
                </Button>
              </Link>
              <Link to="/search">
                <Button 
                  variant="outline" 
                  size="default"
                  className="group text-sm sm:text-base h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 border-2 border-black text-black hover:bg-black/5 w-full sm:w-auto"
                >
                  <Coins className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Explorer les annonces
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-8 pt-4 sm:pt-6 md:pt-8">
              <div className="text-center">
                <div className="font-bold text-lg sm:text-xl md:text-2xl text-black">100K+</div>
                <div className="text-xs sm:text-sm text-gray-600">Utilisateurs actifs</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg sm:text-xl md:text-2xl text-black">50K+</div>
                <div className="text-xs sm:text-sm text-gray-600">Annonces publiées</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg sm:text-xl md:text-2xl text-black">24/7</div>
                <div className="text-xs sm:text-sm text-gray-600">Support client</div>
              </div>
            </div>
          </motion.div>

          {/* Colonne de droite - iPhone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative flex justify-center items-center min-h-[400px]"
          >
            {/* Effet de halo derrière l'iPhone */}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-200/30 via-blue-200/30 to-transparent rounded-full blur-2xl" />
            
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
              className="relative w-[200px] sm:w-[240px] md:w-[280px] lg:w-[320px] xl:w-[380px] transform scale-90 sm:scale-100"
            >
              {/* iPhone Frame */}
              <div className="relative rounded-[48px] bg-[#1A1F2C] p-3 sm:p-4 shadow-2xl">
                {/* Dynamic Island */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[90px] sm:w-[120px] h-[25px] sm:h-[35px] bg-black rounded-b-3xl z-20" />
                
                {/* Écran */}
                <div className="relative bg-white rounded-[36px] overflow-hidden aspect-[9/19.5]">
                  {/* Contenu de l'écran */}
                  <div className="absolute inset-0 p-3 sm:p-4 flex flex-col">
                    {/* En-tête de l'app */}
                    <div className="flex justify-between items-center mb-4 sm:mb-8">
                      <div className="space-y-0.5 sm:space-y-1">
                        <h3 className="text-sm sm:text-base font-semibold">Transaction</h3>
                        <p className="text-[10px] sm:text-xs text-gray-500">#TC-289345</p>
                      </div>
                      <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-green-500 flex items-center justify-center">
                        <Coins className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                      </div>
                    </div>

                    {/* Montant */}
                    <div className="text-center space-y-1 sm:space-y-2 mb-4 sm:mb-8">
                      <p className="text-xs sm:text-sm text-gray-600">Montant total</p>
                      <div className="text-xl sm:text-3xl font-bold">2.45 ETH</div>
                      <p className="text-xs sm:text-sm text-gray-500">≈ 4,892.50 €</p>
                    </div>

                    {/* Indicateurs de sécurité */}
                    <div className="bg-gray-50 rounded-xl p-2 sm:p-4 space-y-2 sm:space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-500" />
                        <span className="text-xs sm:text-sm">Transaction sécurisée</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-500" />
                        <span className="text-xs sm:text-sm">Protection acheteur</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-purple-500" />
                        <span className="text-xs sm:text-sm">Garantie remboursement</span>
                      </div>
                    </div>

                    {/* Bouton de paiement */}
                    <div className="mt-auto">
                      <button className="w-full bg-black text-white rounded-xl py-2 sm:py-4 text-sm sm:text-base font-medium">
                        Confirmer le paiement
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reflets sur l'iPhone */}
              <div className="absolute inset-0 rounded-[48px] bg-gradient-to-tr from-white/5 via-white/10 to-transparent pointer-events-none" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
