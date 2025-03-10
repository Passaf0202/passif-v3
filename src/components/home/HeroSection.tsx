import { Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { MobilePhoneContent } from "./MobilePhoneContent";
import { StatusBar } from "./StatusBar";
import { DynamicIsland } from "./DynamicIsland";
import { RotatingMessages } from "./RotatingMessages";

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
  const [hasInteracted, setHasInteracted] = useState(false);

  return (
    <div className="relative bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 backdrop-blur-[1px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100/30 rounded-full transform translate-x-1/3 -translate-y-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100/30 rounded-full transform -translate-x-1/3 translate-y-1/3 blur-3xl" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-12 relative">
        <div className="flex flex-col items-center md:hidden">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full space-y-4 text-center"
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
              <div>Achetez et vendez vos biens</div>
              <div>avec <span className="highlight-stabilo">des cryptomonnaies.</span></div>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative flex justify-center items-center w-full mt-6 mb-6"
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
              className="relative w-full max-w-[200px] mx-auto transform scale-100 cursor-pointer"
            >
              <div className="relative w-full">
                <div className="absolute inset-0 -z-10 rounded-[52px] bg-gradient-to-tr from-[#E3E4E5] via-[#F3F3F3] to-[#E3E4E5] shadow-xl translate-x-2 translate-y-2" />

                <div className="relative aspect-[19.5/38] w-full">
                  <div className="absolute inset-0 rounded-[52px] bg-gradient-to-tr from-[#E3E4E5] via-[#F3F3F3] to-[#E3E4E5] shadow-lg overflow-hidden">
                    <div className="absolute inset-[1px] rounded-[51px] bg-gradient-to-tr from-primary/5 via-transparent to-white/10" />
                    
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
                    
                    <div className="absolute inset-[3px] rounded-[49px] overflow-hidden">
                      <div className="absolute inset-0 border-[2.5px] border-[#000000] rounded-[49px] z-20" />
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

            <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-primary/5 pointer-events-none rounded-[52px] blur-sm" />
          </motion.div>

          <div className="w-full space-y-3">
            <Link to="/create" className="block w-full">
              <Button 
                size="default"
                className="group text-sm h-10 px-3 bg-primary hover:bg-primary/90 w-full rounded-[25px] min-w-0 truncate"
              >
                <span className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-current flex-shrink-0">
                  <Plus className="h-3 w-3" strokeWidth={3} />
                </span>
                <span className="truncate">Déposer une annonce</span>
                <ArrowRight className="h-3 w-3 ml-2 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" />
              </Button>
            </Link>
            <Link to="/search" className="block w-full">
              <Button 
                variant="outline" 
                size="default"
                className="group text-sm h-10 px-3 bg-white text-primary hover:text-primary hover:bg-gray-50 w-full rounded-[25px] border-2 border-primary min-w-0 truncate"
              >
                <img 
                  src="https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/logos//Logo%20Tradecoiner%20(1).svg" 
                  alt="Tradecoiner"
                  className="h-5 w-5 mr-2 flex-shrink-0"
                />
                <span className="truncate">Explorer les annonces</span>
              </Button>
            </Link>
          </div>

          <div className="w-full mt-6">
            <RotatingMessages />
          </div>
        </div>

        <div className="hidden md:grid md:grid-cols-2 gap-6 lg:gap-8 xl:gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 w-full flex flex-col items-start"
          >
            <h1 className="text-4xl lg:text-5xl xl:text-5xl font-bold text-gray-900 leading-tight text-left">
              <div className="whitespace-nowrap">Achetez et vendez vos biens</div>
              <div>avec <span className="highlight-stabilo">des cryptomonnaies.</span></div>
            </h1>
            
            <RotatingMessages />
            
            <div className="flex flex-row gap-4 w-auto">
              <Link to="/create">
                <Button 
                  size="default"
                  className="group text-base h-12 px-4 bg-primary hover:bg-primary/90 rounded-[25px]"
                >
                  <span className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-current flex-shrink-0">
                    <Plus className="h-4 w-4" strokeWidth={3} />
                  </span>
                  <span>Déposer une annonce</span>
                  <ArrowRight className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" />
                </Button>
              </Link>
              <Link to="/search">
                <Button 
                  variant="outline" 
                  size="default"
                  className="group text-base h-12 px-4 bg-white text-primary hover:text-primary hover:bg-gray-50 rounded-[25px] border-2 border-primary"
                >
                  <img 
                    src="https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/logos//Logo%20Tradecoiner%20(1).svg" 
                    alt="Tradecoiner"
                    className="h-5 w-5 mr-2"
                  />
                  <span>Explorer les annonces</span>
                </Button>
              </Link>
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
              className="relative w-[220px] xl:w-[230px] 2xl:w-[240px] transform scale-100 cursor-pointer"
            >
              <div className="relative w-full">
                <div className="absolute inset-0 -z-10 rounded-[52px] bg-gradient-to-tr from-[#E3E4E5] via-[#F3F3F3] to-[#E3E4E5] shadow-xl translate-x-2 translate-y-2" />

                <div className="relative aspect-[19.5/38] w-full">
                  <div className="absolute inset-0 rounded-[52px] bg-gradient-to-tr from-[#E3E4E5] via-[#F3F3F3] to-[#E3E4E5] shadow-lg overflow-hidden">
                    <div className="absolute inset-[1px] rounded-[51px] bg-gradient-to-tr from-primary/5 via-transparent to-white/10" />
                    
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
                    
                    <div className="absolute inset-[3px] rounded-[49px] overflow-hidden">
                      <div className="absolute inset-0 border-[2.5px] border-[#000000] rounded-[49px] z-20" />
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

            <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-primary/5 pointer-events-none rounded-[52px] blur-sm" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
