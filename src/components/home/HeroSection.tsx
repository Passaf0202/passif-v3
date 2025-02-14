import { Plus, Coins, Diamond, ArrowRight, CheckCircle2, ShieldCheck, Loader2, Wallet, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export function HeroSection() {
  const [transactionState, setTransactionState] = useState<'initial' | 'wallet-connect' | 'wallet-connecting' | 'search' | 'validating' | 'processing' | 'confirmed'>('initial');
  const [showWalletSpotlight, setShowWalletSpotlight] = useState(true);

  // Simuler le cycle de transaction complet
  useEffect(() => {
    const runTransactionCycle = () => {
      setTransactionState('initial');
      setShowWalletSpotlight(true);
      setTimeout(() => setShowWalletSpotlight(false), 2000);
      setTimeout(() => setTransactionState('wallet-connecting'), 2500);
      setTimeout(() => setTransactionState('wallet-connect'), 4000);
      setTimeout(() => setTransactionState('search'), 6000);
      setTimeout(() => setTransactionState('validating'), 8000);
      setTimeout(() => setTransactionState('processing'), 10000);
      setTimeout(() => setTransactionState('confirmed'), 12000);
      setTimeout(() => {
        setTransactionState('initial');
        setShowWalletSpotlight(true);
      }, 15000);
    };

    runTransactionCycle();
    const interval = setInterval(runTransactionCycle, 15000);
    return () => clearInterval(interval);
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
              className="relative w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px] xl:w-[240px] transform scale-90 sm:scale-100"
            >
              <div className="relative rounded-[32px] bg-[#1A1F2C] p-1.5 sm:p-2 shadow-2xl">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[60px] sm:w-[70px] h-[18px] sm:h-[20px] bg-black rounded-b-3xl z-20" />
                
                <div className="relative bg-white rounded-[28px] overflow-hidden aspect-[9/19]">
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={transactionState}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 p-2 flex flex-col"
                    >
                      <div className="relative h-12 px-2 flex items-center justify-between border-b border-gray-200/80 bg-white/80 backdrop-blur-md">
                        <div className="flex items-center">
                          <img 
                            src="https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/logos//Logo%20Tradecoiner%20(1).svg"
                            alt="TRADECOINER"
                            className="h-5 w-auto"
                          />
                        </div>
                        
                        <div className="relative">
                          {showWalletSpotlight && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1.5, opacity: 0.2 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                repeatType: "reverse"
                              }}
                              className="absolute inset-0 bg-primary/20 rounded-full"
                            />
                          )}
                          <motion.button
                            animate={{
                              scale: showWalletSpotlight ? [1, 1.05, 1] : 1
                            }}
                            transition={{
                              duration: 1,
                              repeat: showWalletSpotlight ? Infinity : 0,
                              repeatType: "reverse"
                            }}
                            className={`h-6 px-2 rounded-full whitespace-nowrap flex items-center gap-1.5 text-[8px] 
                              ${transactionState === 'initial' ? 'bg-primary text-white' : 
                                transactionState === 'wallet-connecting' ? 'bg-primary text-white' :
                                'bg-muted text-primary border border-input'}`}
                          >
                            {transactionState === 'wallet-connecting' ? (
                              <>
                                <Loader2 className="h-2 w-2 animate-spin" />
                                Connexion...
                              </>
                            ) : transactionState === 'initial' ? (
                              <>
                                <Wallet className="h-2 w-2" />
                                Connecter Wallet
                              </>
                            ) : (
                              <>
                                <Wallet className="h-2 w-2" />
                                0x12...89ab
                              </>
                            )}
                          </motion.button>
                        </div>
                      </div>

                      <div className="flex-1 p-2">
                        {transactionState === 'initial' || transactionState === 'wallet-connecting' ? (
                          <div className="h-full flex flex-col items-center justify-center space-y-3">
                            <img 
                              src="https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/logos//Logo%20Tradecoiner%20(1).svg"
                              alt="TRADECOINER"
                              className="w-16 h-16 opacity-20"
                            />
                            
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[8px]">1</div>
                                <p className="text-[8px] text-gray-600">Connectez votre wallet pour commencer</p>
                              </div>
                              <div className="flex items-center gap-2 opacity-50">
                                <div className="w-4 h-4 rounded-full bg-gray-400 text-white flex items-center justify-center text-[8px]">2</div>
                                <p className="text-[8px] text-gray-600">Trouvez le produit qui vous intéresse</p>
                              </div>
                              <div className="flex items-center gap-2 opacity-50">
                                <div className="w-4 h-4 rounded-full bg-gray-400 text-white flex items-center justify-center text-[8px]">3</div>
                                <p className="text-[8px] text-gray-600">Payez en crypto de manière sécurisée</p>
                              </div>
                            </div>

                            <p className="text-[8px] text-center text-gray-500">
                              {transactionState === 'initial' 
                                ? "👆 Cliquez sur le bouton en haut à droite" 
                                : "Connexion en cours..."}
                            </p>
                          </div>
                        ) : transactionState === 'search' ? (
                          <div className="flex-1 flex flex-col space-y-2">
                            <div className="flex items-center gap-2 bg-white/90 px-2 py-1 rounded-full shadow-sm text-[8px]">
                              <Search className="h-2 w-2 text-gray-400" />
                              <span className="font-medium">Rechercher une annonce...</span>
                            </div>

                            <div className="flex-1 flex flex-col">
                              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 mb-3">
                                <img 
                                  src="https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/logos//file.svg"
                                  alt="Audi A3"
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              <div className="space-y-2 px-1">
                                <div className="space-y-0.5">
                                  <div className="h-[1px] bg-gray-200" />
                                  <p className="text-[8px] text-gray-400">Marque & Modèle</p>
                                  <p className="text-[10px] font-medium">Audi A3 2023</p>
                                </div>

                                <div className="space-y-0.5">
                                  <div className="h-[1px] bg-gray-200" />
                                  <p className="text-[8px] text-gray-400">Kilométrage</p>
                                  <p className="text-[10px]">15 000 km</p>
                                </div>

                                <div className="space-y-0.5">
                                  <div className="h-[1px] bg-gray-200" />
                                  <p className="text-[8px] text-gray-400">Prix</p>
                                  <div>
                                    <p className="text-[10px] font-medium">2.45 ETH</p>
                                    <p className="text-[8px] text-gray-500">≈ 4,892.50 €</p>
                                  </div>
                                </div>

                                <div className="space-y-0.5">
                                  <div className="h-[1px] bg-gray-200" />
                                  <p className="text-[8px] text-gray-400">État</p>
                                  <p className="text-[10px]">Excellent état</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="relative aspect-video mb-2 rounded-lg overflow-hidden bg-gray-100">
                              <motion.div 
                                className="absolute inset-0 flex items-center justify-center"
                                animate={{
                                  scale: transactionState === 'processing' ? [1, 1.02, 1] : 1
                                }}
                                transition={{ duration: 1, repeat: transactionState === 'processing' ? Infinity : 0 }}
                              >
                                <div className="relative w-full h-full">
                                  <img 
                                    src="https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/logos//Logo%20Tradecoiner%20(1).svg"
                                    alt="TRADECOINER"
                                    className="absolute inset-0 w-full h-full object-contain p-4 opacity-10"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20" />
                                </div>
                              </motion.div>
                              <div className="absolute bottom-1 right-1">
                                <div className="text-[8px] bg-black/80 text-white px-1.5 py-0.5 rounded-full">
                                  Audi A3 2023
                                </div>
                              </div>
                            </div>

                            <motion.div 
                              className="text-center space-y-1 mb-2"
                              animate={{
                                scale: transactionState === 'processing' ? [1, 1.02, 1] : 1
                              }}
                              transition={{ duration: 1, repeat: transactionState === 'processing' ? Infinity : 0 }}
                            >
                              <p className="text-[8px] sm:text-[10px] text-gray-600">
                                {transactionState === 'validating' ? "Vérification du montant" :
                                 transactionState === 'processing' ? "Transfert en cours" :
                                 "Paiement confirmé"
                                }
                              </p>
                              <div className="text-base sm:text-lg font-bold">2.45 ETH</div>
                              <p className="text-[8px] sm:text-[10px] text-gray-500">≈ 4,892.50 €</p>
                            </motion.div>

                            <div className="bg-gray-50 rounded-lg p-1.5 sm:p-2 space-y-1">
                              <motion.div 
                                className="flex items-center gap-1.5"
                                animate={{ opacity: transactionState !== 'validating' ? 1 : 0.5 }}
                              >
                                <motion.div 
                                  className="h-1 w-1 rounded-full bg-green-500"
                                  animate={{ scale: transactionState === 'validating' ? [1, 1.5, 1] : 1 }}
                                  transition={{ duration: 1, repeat: transactionState === 'validating' ? Infinity : 0 }}
                                />
                                <span className="text-[8px] sm:text-[10px]">Transaction sécurisée</span>
                              </motion.div>
                              <motion.div 
                                className="flex items-center gap-1.5"
                                animate={{ opacity: transactionState === 'processing' || transactionState === 'confirmed' ? 1 : 0.5 }}
                              >
                                <motion.div 
                                  className="h-1 w-1 rounded-full bg-blue-500"
                                  animate={{ scale: transactionState === 'processing' ? [1, 1.5, 1] : 1 }}
                                  transition={{ duration: 1, repeat: transactionState === 'processing' ? Infinity : 0 }}
                                />
                                <span className="text-[8px] sm:text-[10px]">Protection acheteur</span>
                              </motion.div>
                              <motion.div 
                                className="flex items-center gap-1.5"
                                animate={{ opacity: transactionState === 'confirmed' ? 1 : 0.5 }}
                              >
                                <motion.div 
                                  className="h-1 w-1 rounded-full bg-purple-500"
                                  animate={{ scale: transactionState === 'confirmed' ? [1, 1.5, 1] : 1 }}
                                />
                                <span className="text-[8px] sm:text-[10px]">Garantie remboursement</span>
                              </motion.div>
                            </div>

                            <div className="mt-auto">
                              <motion.button 
                                className={`w-full rounded-lg py-1 sm:py-1.5 text-[8px] sm:text-[10px] font-medium text-white
                                  ${transactionState === 'validating' ? 'bg-indigo-500' :
                                    transactionState === 'processing' ? 'bg-blue-500' :
                                    'bg-green-500'}`}
                                animate={{
                                  scale: transactionState === 'confirmed' ? [1, 1.05, 1] : 1
                                }}
                                transition={{ duration: 0.5 }}
                              >
                                {transactionState === 'validating' && "Vérification..."}
                                {transactionState === 'processing' && "Traitement en cours..."}
                                {transactionState === 'confirmed' && "Transaction réussie !"}
                              </motion.button>
                            </div>
                          </>
                        )}
                      </div>

                      {transactionState !== 'initial' && (
                        <div className="h-0.5 bg-gray-100">
                          <motion.div 
                            className="h-full bg-primary"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2 }}
                          />
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              <div className="absolute inset-0 rounded-[32px] bg-gradient-to-tr from-white/5 via-white/10 to-transparent pointer-events-none" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
