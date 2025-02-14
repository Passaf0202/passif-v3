
import { Plus, Coins, Diamond, ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

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

          {/* Colonne de droite - Exemples d'Annonces */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative flex justify-center items-center"
          >
            {/* Container des annonces superposées */}
            <div className="relative w-full max-w-md aspect-[4/3] flex justify-center">
              {/* Annonce 3 (Arrière-plan) */}
              <motion.div
                animate={{ 
                  y: [0, -2, 0]
                }}
                transition={{ 
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
                className="absolute w-[200px] rounded-lg shadow-sm bg-white border border-black/10 transform -translate-x-8 translate-y-4"
              >
                {/* Structure de l'annonce */}
                <div className="h-[120px] bg-gray-100 rounded-t-lg" />
                <div className="p-3 space-y-2">
                  <div className="h-2 w-3/4 bg-gray-200 rounded" />
                  <div className="h-2 w-1/2 bg-gray-200 rounded" />
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-gray-300" />
                    <div className="h-2 w-1/3 bg-gray-200 rounded" />
                  </div>
                </div>
              </motion.div>

              {/* Annonce 2 (Milieu) */}
              <motion.div
                animate={{ 
                  y: [0, -4, 0]
                }}
                transition={{ 
                  duration: 6,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                  delay: 0.1
                }}
                className="absolute w-[200px] rounded-lg shadow-sm bg-white border border-black/10 transform translate-x-0 translate-y-2"
              >
                {/* Structure de l'annonce */}
                <div className="h-[120px] bg-gray-100 rounded-t-lg" />
                <div className="p-3 space-y-2">
                  <div className="h-2 w-2/3 bg-gray-200 rounded" />
                  <div className="h-2 w-1/2 bg-gray-200 rounded" />
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-gray-300" />
                    <div className="h-2 w-1/3 bg-gray-200 rounded" />
                  </div>
                </div>
              </motion.div>

              {/* Annonce 1 (Premier plan) - Plus détaillée */}
              <motion.div
                animate={{ 
                  y: [0, -6, 0]
                }}
                transition={{ 
                  duration: 7,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                  delay: 0.2
                }}
                className="absolute w-[200px] rounded-lg shadow-md bg-white border border-black/10 transform translate-x-8"
              >
                {/* Structure de l'annonce */}
                <div className="h-[120px] bg-gray-100 rounded-t-lg flex items-center justify-center">
                  <div className="text-gray-400 text-sm">Image du produit</div>
                </div>
                <div className="p-3 space-y-2">
                  <div className="h-2 w-3/4 bg-gray-200 rounded" />
                  <div className="h-2 w-1/2 bg-gray-200 rounded font-semibold" />
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-gray-300" />
                    <div className="h-2 w-1/3 bg-gray-200 rounded" />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
