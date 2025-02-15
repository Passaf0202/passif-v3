
import { Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { MobilePhoneContent } from "./MobilePhoneContent";
import { StatusBar } from "./StatusBar";
import { DynamicIsland } from "./DynamicIsland";

export type TransactionState = 
  | 'initial'               
  | 'wallet-connect'        
  | 'wallet-connecting'     
  | 'payment'              
  | 'processing'           
  | 'awaiting-confirmation' 
  | 'confirmed';

export function HeroSection() {
  const [transactionState, setTransactionState] = useState<TransactionState>('initial');

  return (
    <div className="relative bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 backdrop-blur-[1px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100/30 rounded-full transform translate-x-1/3 -translate-y-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100/30 rounded-full transform -translate-x-1/3 translate-y-1/3 blur-3xl" />
      </div>
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-8 lg:py-12 relative">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-3 sm:space-y-4 md:space-y-6"
          >
            <div className="inline-flex items-center gap-2 bg-white/90 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full shadow-sm">
              <img 
                src="https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/logos//Logo%20Tradecoiner%20(1).svg" 
                alt="Tradecoiner"
                className="h-3 w-3 sm:h-4 sm:w-4 [&>path]:fill-primary"
              />
              <span className="text-xs sm:text-sm font-medium">La marketplace de seconde main N°1 au monde avec paiement en cryptomonnaie !</span>
            </div>
            
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">
              Achetez et vendez avec
              <span className="text-primary"> crypto</span>
              <br /> en toute confiance
            </h1>
            
            <p className="text-sm sm:text-base md:text-lg text-gray-600">
              TRADECOINER révolutionne les transactions en ligne en combinant la sécurité de la blockchain avec la simplicité d'une marketplace moderne.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Link to="/create">
                <Button 
                  size="default"
                  className="group text-xs sm:text-sm md:text-base h-8 sm:h-10 md:h-12 px-3 sm:px-4 md:px-6 bg-primary hover:bg-primary/90 w-full sm:w-auto"
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
                  className="group text-xs sm:text-sm md:text-base h-8 sm:h-10 md:h-12 px-3 sm:px-4 md:px-6 border-2 border-primary text-primary hover:bg-primary/5 w-full sm:w-auto"
                >
                  <img 
                    src="https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/logos//Logo%20Tradecoiner%20(1).svg" 
                    alt="Tradecoiner"
                    className="h-3 w-3 sm:h-4 sm:w-4 mr-2 [&>path]:fill-primary"
                  />
                  Explorer les annonces
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-3 sm:pt-4">
              <div className="text-center">
                <div className="font-bold text-base sm:text-lg md:text-xl lg:text-2xl text-primary">100K+</div>
                <div className="text-xs sm:text-sm text-gray-600">Utilisateurs actifs</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-base sm:text-lg md:text-xl lg:text-2xl text-primary">50K+</div>
                <div className="text-xs sm:text-sm text-gray-600">Annonces publiées</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-base sm:text-lg md:text-xl lg:text-2xl text-primary">24/7</div>
                <div className="text-xs sm:text-sm text-gray-600">Support client</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative flex justify-center items-center"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-200/30 via-blue-200/30 to-transparent rounded-full blur-2xl" />
            
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
              className="relative w-[180px] sm:w-[200px] md:w-[220px] lg:w-[240px] xl:w-[260px] transform scale-100"
            >
              <div className="relative w-full">
                <div className="absolute inset-0 -z-10 rounded-[48px] bg-gradient-to-tr from-[#E3E4E5] via-[#F3F3F3] to-[#E3E4E5] shadow-xl translate-x-2 translate-y-2" />

                <div className="relative aspect-[19.5/38] w-full">
                  <div className="absolute inset-0 rounded-[48px] bg-gradient-to-tr from-[#E3E4E5] via-[#F3F3F3] to-[#E3E4E5] shadow-lg overflow-hidden">
                    <div className="absolute inset-[1px] rounded-[47px] bg-gradient-to-tr from-primary/5 via-transparent to-white/10" />
                    
                    <div className="absolute left-[-2px] top-[120px] w-[5px] h-16 flex flex-col gap-4">
                      <div className="h-8 w-full relative group">
                        <div className="absolute inset-[-1px] right-[2px] bg-gradient-to-l from-primary/40 to-transparent rounded-l-md blur-[0.5px]" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#D1D2D3] to-[#E3E4E5] rounded-l-md" />
                        <div className="absolute inset-[0.5px] bg-gradient-to-br from-[#E8E9EA] to-[#D8D9DA] rounded-l-md opacity-95 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-x-0 top-0 h-[1px] bg-white/50" />
                      </div>
                      <div className="h-8 w-full relative group">
                        <div className="absolute inset-[-1px] right-[2px] bg-gradient-to-l from-primary/40 to-transparent rounded-l-md blur-[0.5px]" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#D1D2D3] to-[#E3E4E5] rounded-l-md" />
                        <div className="absolute inset-[0.5px] bg-gradient-to-br from-[#E8E9EA] to-[#D8D9DA] rounded-l-md opacity-95 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-x-0 top-0 h-[1px] bg-white/50" />
                      </div>
                    </div>

                    <div className="absolute right-[-2px] top-[100px] w-[5px] h-12">
                      <div className="h-12 w-full relative group">
                        <div className="absolute inset-[-1px] left-[2px] bg-gradient-to-r from-primary/40 to-transparent rounded-r-md blur-[0.5px]" />
                        <div className="absolute inset-0 bg-gradient-to-l from-[#D1D2D3] to-[#E3E4E5] rounded-r-md" />
                        <div className="absolute inset-[0.5px] bg-gradient-to-bl from-[#E8E9EA] to-[#D8D9DA] rounded-r-md opacity-95 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-x-0 top-0 h-[1px] bg-white/50" />
                      </div>
                    </div>
                    
                    <div className="absolute inset-[3px] rounded-[45px] overflow-hidden">
                      <div className="absolute inset-0 border-[2.5px] border-[#000000] rounded-[45px] z-20" />
                      <div className="absolute inset-0 bg-white">
                        <StatusBar />
                        <DynamicIsland />
                        <div className="relative w-full h-full pt-20 pointer-events-auto">
                          <MobilePhoneContent 
                            transactionState={transactionState}
                            onStateChange={setTransactionState}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="absolute bottom-[10px] left-1/2 -translate-x-1/2 w-[80px] h-[4px] bg-[#000000] rounded-full" />
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-primary/5 pointer-events-none rounded-[48px] blur-sm" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
