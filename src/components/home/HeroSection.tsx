
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
              className="relative w-[180px] sm:w-[200px] md:w-[220px] lg:w-[240px] xl:w-[260px] transform scale-100"
            >
              <div className="relative w-full">
                <div className="absolute inset-0 -z-10 rounded-[48px] bg-gradient-to-tr from-[#E3E4E5] via-[#F3F3F3] to-[#E3E4E5] shadow-xl translate-x-2 translate-y-2" />

                <div className="relative aspect-[19.5/38] w-full">
                  <div className="absolute inset-0 rounded-[48px] bg-gradient-to-tr from-[#E3E4E5] via-[#F3F3F3] to-[#E3E4E5] shadow-lg overflow-hidden">
                    <div className="absolute inset-[1px] rounded-[47px] bg-gradient-to-tr from-black/5 via-transparent to-white/10" />
                    
                    <div className="absolute left-[-2px] top-[120px] w-[5px] h-16 flex flex-col gap-4">
                      <div className="h-8 w-full relative group">
                        <div className="absolute inset-[-1px] right-[2px] bg-gradient-to-l from-black/40 to-transparent rounded-l-md blur-[0.5px]" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#D1D2D3] to-[#E3E4E5] rounded-l-md" />
                        <div className="absolute inset-[0.5px] bg-gradient-to-br from-[#E8E9EA] to-[#D8D9DA] rounded-l-md opacity-95 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-x-0 top-0 h-[1px] bg-white/50" />
                      </div>
                      <div className="h-8 w-full relative group">
                        <div className="absolute inset-[-1px] right-[2px] bg-gradient-to-l from-black/40 to-transparent rounded-l-md blur-[0.5px]" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#D1D2D3] to-[#E3E4E5] rounded-l-md" />
                        <div className="absolute inset-[0.5px] bg-gradient-to-br from-[#E8E9EA] to-[#D8D9DA] rounded-l-md opacity-95 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-x-0 top-0 h-[1px] bg-white/50" />
                      </div>
                    </div>

                    <div className="absolute right-[-2px] top-[100px] w-[5px] h-12">
                      <div className="h-12 w-full relative group">
                        <div className="absolute inset-[-1px] left-[2px] bg-gradient-to-r from-black/40 to-transparent rounded-r-md blur-[0.5px]" />
                        <div className="absolute inset-0 bg-gradient-to-l from-[#D1D2D3] to-[#E3E4E5] rounded-r-md" />
                        <div className="absolute inset-[0.5px] bg-gradient-to-bl from-[#E8E9EA] to-[#D8D9DA] rounded-r-md opacity-95 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-x-0 top-0 h-[1px] bg-white/50" />
                      </div>
                    </div>
                    
                    <div className="absolute inset-[3px] rounded-[45px] overflow-hidden">
                      <div className="absolute inset-0 border-[2.5px] border-black rounded-[45px] z-20" />
                      <div className="absolute inset-0 bg-white">
                        <div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-[65px] h-[19px] bg-black rounded-[25px] z-30 overflow-hidden">
                          <div className="absolute inset-0 bg-black" />
                          
                          <div className="absolute top-1/2 right-[22%] -translate-y-1/2 w-[4px] h-[4px] rounded-full">
                            <div className="absolute inset-0 bg-black rounded-full" />
                            <div className="absolute inset-[0.75px] bg-black rounded-full" />
                            <div className="absolute inset-[1.25px] bg-black rounded-full" />
                            <div className="absolute top-[25%] left-[25%] w-[0.5px] h-[0.5px] bg-white/15 rounded-full" />
                          </div>
                        </div>

                        <div className="absolute top-0 left-0 right-0 h-[44px] px-8 flex items-center justify-between z-10">
                          <span className="font-semibold text-[9px] tracking-wide text-black translate-y-[1px]">9:41</span>
                          <div className="flex items-center gap-[1px] translate-y-[1px] mr-[-8px]">
                            <svg width="18" height="12" viewBox="0 0 18 12" fill="none" className="scale-[0.65]">
                              <rect x="14" y="1" width="2" height="9" rx="0.7" fill="currentColor" className="text-black"/>
                              <rect x="10.5" y="3" width="2" height="7" rx="0.7" fill="currentColor" className="text-black"/>
                              <rect x="7" y="5" width="2" height="5" rx="0.7" fill="currentColor" className="text-black"/>
                              <rect x="3.5" y="7" width="2" height="3" rx="0.7" fill="currentColor" className="text-black"/>
                              <rect x="0" y="9" width="2" height="1" rx="0.5" fill="currentColor" className="text-black opacity-30"/>
                            </svg>

                            <span className="text-[6.5px] font-semibold text-black translate-y-[0px] ml-[1px]">5G</span>

                            <div className="relative h-[13px] w-[24px] translate-y-[0px] ml-[1px]">
                              <svg width="24" height="13" viewBox="0 0 24 13" fill="none" className="scale-[0.65]">
                                <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" className="stroke-black" strokeWidth="0.75"/>
                                <rect x="2" y="2" width="18" height="8" rx="1.5" className="fill-black"/>
                                <rect x="22.5" y="3.5" width="1" height="5" rx="0.5" className="fill-black"/>
                              </svg>
                            </div>
                          </div>
                        </div>

                        <div className="relative w-full h-full pt-20">
                          <MobilePhoneContent 
                            transactionState={transactionState}
                            showWalletSpotlight={showWalletSpotlight}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="absolute bottom-[10px] left-1/2 -translate-x-1/2 w-[80px] h-[4px] bg-black rounded-full" />
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
