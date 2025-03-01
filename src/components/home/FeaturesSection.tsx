
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Zap, Bitcoin, Lock, Circle, CircleDot } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect, useRef } from "react";

export function FeaturesSection() {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  const features = [{
    title: "Fini les arnaques",
    description: "Tous les utilisateurs sur Tradecoiner doivent vérifier leur identité.",
    icon: Shield
  }, {
    title: "Transactions ultra sécurisées",
    description: "Toute transaction est sécurisée et traçable sur la blockchain Polygon.",
    icon: Lock
  }, {
    title: "Paiement instantané",
    description: "Payez directement depuis votre wallet en quelques secondes.",
    icon: Zap
  }, {
    title: "Économisez sur les frais",
    description: "Transactions à faible coût pour l'acheteur, gratuites pour le vendeur.",
    icon: Bitcoin
  }];

  const scrollToFeature = (index: number) => {
    if (containerRef.current) {
      const container = containerRef.current;
      const items = container.querySelectorAll('.snap-center');
      if (items[index]) {
        const scrollLeft = items[index].getBoundingClientRect().left + container.scrollLeft - container.getBoundingClientRect().left;
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        setActiveIndex(index);
      }
    }
  };

  // Détection du défilement pour mettre à jour l'indicateur actif
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isMobile) return;

    const handleScroll = () => {
      const items = container.querySelectorAll('.snap-center');
      const containerLeft = container.getBoundingClientRect().left;
      const containerCenter = containerLeft + container.offsetWidth / 2;
      
      let closestIndex = 0;
      let minDistance = Infinity;
      
      items.forEach((item, index) => {
        const itemRect = item.getBoundingClientRect();
        const itemCenter = itemRect.left + itemRect.width / 2;
        const distance = Math.abs(containerCenter - itemCenter);
        
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });
      
      setActiveIndex(closestIndex);
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile]);

  return <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Utilisez enfin vos cryptos <span className="highlight-stabilo">sans prendre de risque</span>
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">L'endroit idéal pour faire vos achats en cryptomonnaies</p>
          </div>

          {isMobile ? (
            <>
              <div 
                ref={containerRef} 
                className="flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory no-scrollbar"
              >
                {features.map((feature, index) => (
                  <div key={index} className="snap-center min-w-[280px] w-[80%] shrink-0">
                    <Card className="border-0 shadow-sm overflow-hidden h-full">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center justify-center mb-4">
                            <div className="bg-black rounded-full p-3">
                              <feature.icon size={24} className="text-white" />
                            </div>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                            {feature.title}
                          </h3>
                          <p className="text-gray-600 text-center">
                            {feature.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center mt-4">
                <div className="flex gap-2 items-center">
                  {features.map((_, index) => (
                    <button 
                      key={index}
                      onClick={() => scrollToFeature(index)}
                      className="focus:outline-none"
                      aria-label={`Voir la caractéristique ${index + 1}`}
                    >
                      {index === activeIndex ? (
                        <CircleDot className="w-4 h-4 text-primary" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-300" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
              {features.map((feature, index) => (
                <Card key={index} className="border-0 shadow-sm overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col">
                      <div className="flex items-center mb-4">
                        <div className="bg-black rounded-full p-2 mr-3">
                          <feature.icon size={16} className="text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {feature.title}
                        </h3>
                      </div>
                      <p className="text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>;
}
