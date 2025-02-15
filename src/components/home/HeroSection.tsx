import { Plus, Coins, Diamond, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { MobilePhoneContent } from "./MobilePhoneContent";

export function HeroSection() {
  const [transactionState, setTransactionState] = useState<'initial' | 'wallet-connect' | 'wallet-connecting' | 'payment' | 'processing' | 'confirmed'>('initial');
  const [showWalletSpotlight, setShowWalletSpotlight] = useState(true);

  useEffect(() => {
    const runTransactionCycle = () => {
      setTransactionState('initial');
      setShowWalletSpotlight(true);
      setTimeout(() => setShowWalletSpotlight(false), 5000);
      setTimeout(() => setTransactionState('wallet-connecting'), 6000);
      setTimeout(() => setTransactionState('wallet-connect'), 8000);
      setTimeout(() => setTransactionState('payment'), 12000);
      setTimeout(() => setTransactionState('processing'), 15000);
      setTimeout(() => setTransactionState('confirmed'), 18000);
      setTimeout(() => {
        setTransactionState('initial');
        setShowWalletSpotlight(true);
      }, 25000);
    };

    const initialTimeout = setTimeout(() => {
      runTransactionCycle();
      const interval = setInterval(runTransactionCycle, 25000);
      return () => clearInterval(interval);
    }, 2000);

    return () => clearTimeout(initialTimeout);
  }, []);

  return (
    <div className="relative bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/5 to-black/10 backdrop-blur-[1px]" />
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
              className="relative w-[200px] sm:w-[220px] md:w-[240px] lg:w-[260px] xl:w-[280px] transform scale-100"
            >
              <div className="relative w-full">
                <div className="absolute inset-0 -z-10 rounded-[48px] bg-gradient-to-tr from-[#E3E4E5] via-[#F3F3F3] to-[#E3E4E5] shadow-xl translate-x-2 translate-y-2">
                  <div className="absolute top-8 left-8 w-24 h-24 bg-[#1A1B1E] rounded-[24px] flex items-center justify-center">
                    <div className="relative w-20 h-20">
                      <div className="absolute inset-0 bg-[#222] rounded-full" />
                      <div className="absolute inset-2 bg-[#1A1B1E] rounded-full" />
                      <div className="absolute inset-3 bg-[#000] rounded-full" />
                      <div className="absolute inset-4 bg-[#111] rounded-full ring-2 ring-[#222]/20">
                        <div className="absolute inset-2 bg-[#000] rounded-full" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8">
                    <div className="w-full h-full bg-[#1A1B1E] mask-apple-logo" />
                  </div>
                </div>

                <div className="relative aspect-[19.5/42] w-full">
                  <div className="absolute inset-0 rounded-[48px] bg-gradient-to-tr from-[#E3E4E5] via-[#F3F3F3] to-[#E3E4E5] shadow-lg overflow-hidden">
                    <div className="absolute inset-[1px] rounded-[47px] bg-gradient-to-tr from-black/5 via-transparent to-white/10" />
                    <div className="absolute left-[-2px] top-[120px] w-[4px] h-16 flex flex-col gap-4">
                      <div className="h-8 w-full bg-gradient-to-r from-[#1A1B1E] to-[#222] rounded-r-sm shadow-[2px_2px_4px_rgba(0,0,0,0.2)] before:content-[''] before:absolute before:inset-0 before:bg-black/10" />
                      <div className="h-8 w-full bg-gradient-to-r from-[#1A1B1E] to-[#222] rounded-r-sm shadow-[2px_2px_4px_rgba(0,0,0,0.2)] before:content-[''] before:absolute before:inset-0 before:bg-black/10" />
                    </div>
                    <div className="absolute right-[-2px] top-[100px] w-[4px] h-12">
                      <div className="h-12 w-full bg-gradient-to-l from-[#1A1B1E] to-[#222] rounded-l-sm shadow-[-2px_2px_4px_rgba(0,0,0,0.2)] before:content-[''] before:absolute before:inset-0 before:bg-black/10" />
                    </div>
                    <div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-[120px] h-[25px] bg-black rounded-[20px] z-20 overflow-hidden shadow-[inset_0_0_5px_rgba(255,255,255,0.1)]">
                      <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-black/95" />
                      <div className="absolute top-1/2 left-[20%] -translate-y-1/2 w-[8px] h-[8px] bg-[#1A1B1E] rounded-full" />
                      <div className="absolute top-1/2 right-[20%] -translate-y-1/2 w-[8px] h-[8px] bg-[#1A1B1E] rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" />
                    </div>
                    <div className="absolute inset-[3px] rounded-[45px] bg-white overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-6 px-6 flex items-center justify-between text-xs font-medium z-10">
                        <span>9:41</span>
                        <div className="flex items-center gap-1.5">
                          <div className="flex gap-0.5 items-center">
                            <div className="w-4 h-2.5 flex items-end gap-px">
                              <div className="w-0.5 h-1.5 bg-black rounded-sm" />
                              <div className="w-0.5 h-2 bg-black rounded-sm" />
                              <div className="w-0.5 h-2.5 bg-black rounded-sm" />
                              <div className="w-0.5 h-1.5 bg-black/30 rounded-sm" />
                            </div>
                            <div className="h-3 w-3 -mt-px">
                              <svg viewBox="0 0 24 24" className="w-full h-full fill-current">
                                <path d="M1.999 5.001A1 1 0 013 4h18a1 1 0 011 1.001V19a1 1 0 01-1 1.001H3a1 1 0 01-1-1.001V5.001zM4 6v12h16V6H4z" />
                              </svg>
                            </div>
                            <div className="h-3 w-6 relative">
                              <div className="absolute inset-0 border-2 border-black rounded-sm" />
                              <div className="absolute inset-0.5 bg-black rounded-sm" style={{ width: '66%' }} />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="relative h-full w-full bg-white">
                        <MobilePhoneContent 
                          transactionState={transactionState}
                          showWalletSpotlight={showWalletSpotlight}
                        />
                      </div>
                    </div>
                    <div className="absolute bottom-[12px] left-1/2 -translate-x-1/2 w-[100px] h-[4px] bg-black rounded-full" />
                    <div className="absolute inset-0 rounded-[48px] bg-gradient-to-tr from-white/20 via-transparent to-black/10 pointer-events-none" />
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/5 pointer-events-none rounded-[48px] blur-sm" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
