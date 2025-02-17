
import { RotatingMessages } from "./RotatingMessages";

interface HeroSectionProps {
  isMobile?: boolean;
}

export const HeroSection = ({ isMobile }: HeroSectionProps) => {
  return (
    <section className="w-full py-8 md:py-12">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">
            TRADECOINER
          </h1>
          <RotatingMessages isMobile={isMobile} />
        </div>
      </div>
    </section>
  );
};
