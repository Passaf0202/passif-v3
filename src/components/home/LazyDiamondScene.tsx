
import { Suspense, lazy } from 'react';
import { Loader2 } from "lucide-react";

const DiamondViewer = lazy(() => import('./DiamondViewer'));

interface LazyDiamondSceneProps {
  state: 'initial' | 'wallet-connect' | 'wallet-connecting' | 'payment' | 'processing' | 'confirmed';
}

export function LazyDiamondScene({ state }: LazyDiamondSceneProps) {
  return (
    <div className="relative w-[300px] h-[300px] mx-auto">
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
