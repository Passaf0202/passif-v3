
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-24 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Colonne de gauche - Texte */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 bg-white/90 px-4 py-2 rounded-full shadow-sm">
              <Diamond className="h-5 w-5 text-black" />
              <span className="text-sm font-medium">La marketplace crypto #1 en France</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight">
              Achetez et vendez avec
              <span className="text-black"> crypto</span>
              <br /> en toute confiance
            </h1>
            
            <p className="text-xl text-gray-600">
              TRADECOINER révolutionne les transactions en ligne en combinant la sécurité de la blockchain avec la simplicité d'une marketplace moderne.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/create">
                <Button size="lg" className="group text-lg h-14 px-8 bg-black hover:bg-black/90">
                  <Plus className="h-5 w-5 mr-2" />
                  Déposer une annonce
                  <ArrowRight className="h-5 w-5 ml-2 opacity-0 group-hover:opacity-100 transition-all" />
                </Button>
              </Link>
              <Link to="/search">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="group text-lg h-14 px-8 border-2 border-black text-black hover:bg-black/5"
                >
                  <Coins className="h-5 w-5 mr-2" />
                  Explorer les annonces
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <div className="font-bold text-2xl text-black">100K+</div>
                <div className="text-sm text-gray-600">Utilisateurs actifs</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-2xl text-black">50K+</div>
                <div className="text-sm text-gray-600">Annonces publiées</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-2xl text-black">24/7</div>
                <div className="text-sm text-gray-600">Support client</div>
              </div>
            </div>
          </motion.div>

          {/* Colonne de droite - iPhone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative flex justify-center items-center"
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
              className="relative w-[300px] sm:w-[380px]"
            >
              {/* iPhone Frame */}
              <div className="relative rounded-[48px] bg-[#1A1F2C] p-4 shadow-2xl">
                {/* Dynamic Island */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120px] h-[35px] bg-black rounded-b-3xl z-20" />
                
                {/* Écran */}
                <div className="relative bg-white rounded-[36px] overflow-hidden aspect-[9/19.5]">
                  {/* Contenu de l'écran */}
                  <div className="absolute inset-0 p-4 flex flex-col">
                    {/* En-tête de l'app */}
                    <div className="flex justify-between items-center mb-8">
                      <div className="space-y-1">
                        <h3 className="font-semibold">Transaction</h3>
                        <p className="text-xs text-gray-500">#TC-289345</p>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                        <Coins className="h-4 w-4 text-white" />
                      </div>
                    </div>

                    {/* Montant */}
                    <div className="text-center space-y-2 mb-8">
                      <p className="text-sm text-gray-600">Montant total</p>
                      <div className="text-3xl font-bold">2.45 ETH</div>
                      <p className="text-sm text-gray-500">≈ 4,892.50 €</p>
                    </div>

                    {/* Indicateurs de sécurité */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span>Transaction sécurisée</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <span>Protection acheteur</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="h-2 w-2 rounded-full bg-purple-500" />
                        <span>Garantie remboursement</span>
                      </div>
                    </div>

                    {/* Bouton de paiement */}
                    <div className="mt-auto">
                      <button className="w-full bg-black text-white rounded-xl py-4 font-medium">
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
