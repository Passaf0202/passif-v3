
import { motion } from "framer-motion";

interface LogoViewerProps {
  state: 'initial' | 'wallet-connect' | 'wallet-connecting' | 'payment' | 'processing' | 'confirmed';
}

export function LogoViewer({ state }: LogoViewerProps) {
  const getScale = () => {
    switch (state) {
      case 'confirmed':
        return 1.1;
      default:
        return 1;
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <motion.img
        src="https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/logos//Logo%20Tradecoiner%20(1).svg"
        alt="TRADECOINER"
        className="w-32 h-32"
        animate={{
          scale: getScale(),
          rotate: state === 'processing' ? [0, 360] : 0
        }}
        transition={{
          duration: state === 'processing' ? 2 : 0.5,
          ease: "easeInOut",
          repeat: state === 'processing' ? Infinity : 0
        }}
      />
    </div>
  );
}
