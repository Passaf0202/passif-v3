
import { Suspense, lazy } from 'react';
import { Loader2 } from "lucide-react";
import type { TransactionState } from './HeroSection';

const DiamondViewer = lazy(() => import('./DiamondViewer').then(mod => ({ 
  default: mod.DiamondViewer 
})));

interface LazyDiamondSceneProps {
  state: TransactionState;
}

export function LazyDiamondScene({ state }: LazyDiamondSceneProps) {
  return (
    <div className="relative w-full aspect-square max-w-[280px] max-h-[280px] mx-auto">
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      }>
        <DiamondViewer state={state} />
      </Suspense>
    </div>
  );
}
