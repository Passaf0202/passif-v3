
import { Suspense, lazy } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

const DiamondViewer = lazy(() => import('./DiamondViewer'));

interface LazyDiamondSceneProps {
  state: 'initial' | 'wallet-connect' | 'wallet-connecting' | 'payment' | 'processing' | 'confirmed';
}

export function LazyDiamondScene({ state }: LazyDiamondSceneProps) {
  return (
    <div className="relative w-full aspect-square max-w-[320px] max-h-[320px] mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full"
        >
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
                <span className="text-sm text-primary/50">Chargement...</span>
              </div>
            </div>
          }>
            <DiamondViewer state={state} />
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
