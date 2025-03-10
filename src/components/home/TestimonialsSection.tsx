
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { Check, Circle, CircleDot } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const testimonials = [
  {
    quote: "J'avais peur d'acheter en crypto mais Tradecoiner fait tout pour que les transactions se passent bien ce qui m'a rassuré. J'ai fait quelques achats jusqu'à maintenant et tout s'est passé à merveille. Rien à dire, c'est rapide, sécurisé, et on paie au prix juste. Que demander de plus ? J'ai reçu mes produits sans souci comme ailleurs. Une super expérience !",
    author: "Thomas L.",
    verified: true
  },
  {
    quote: "J'ai vendu plusieurs produits sur Tradecoiner et ce que j'apprécie le plus, c'est la rapidité de transaction et de réception des fonds. En quelques clics, l'acheteur paie son produit et le vendeur reçoit l'argent instantanément et de manière sécurisé sans transmettre ses données bancaires. C'est vraiment révolutionnaire",
    author: "Sophie M.",
    verified: true
  },
  {
    quote: "J'ai trouvé un super deal et payé en quelques secondes avec mon wallet Metamask. N'étant pas adepte de ce monde des cryptomonnaies, j'ai quand même réussi à effectuer des transactions facilement grâce à TC. Le vendeur a été payé instantanément et tout était clair du début à la fin. Une plateforme au top. Je continuerai à utiliser",
    author: "Alexandre D.",
    verified: true
  }
];

export function TestimonialsSection() {
  const isMobile = useIsMobile();
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const scrollToTestimonial = (index: number) => {
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

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Ce que disent nos utilisateurs
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez pourquoi ils choisissent Tradecoiner pour leurs transactions crypto.
          </p>
        </div>

        {isMobile ? (
          <>
            <div 
              ref={containerRef}
              className="flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory no-scrollbar"
            >
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index} 
                  className="snap-center min-w-[280px] w-[85%] shrink-0"
                >
                  <TestimonialCard testimonial={testimonial} />
                </div>
              ))}
            </div>
            
            <div className="flex justify-center mt-4">
              <div className="flex gap-2 items-center">
                {testimonials.map((_, index) => (
                  <button 
                    key={index}
                    onClick={() => scrollToTestimonial(index)}
                    className="focus:outline-none"
                    aria-label={`Voir l'avis ${index + 1}`}
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
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

interface TestimonialCardProps {
  testimonial: {
    quote: string;
    author: string;
    verified: boolean;
  };
}

function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <Card className="border border-gray-200 overflow-hidden h-full">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <span className="text-4xl text-gray-300 font-serif">"</span>
          {testimonial.verified && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <Check size={12} className="mr-1" />
              Avis vérifié
            </span>
          )}
        </div>
        
        <p className="text-gray-700 mb-4">{testimonial.quote}</p>
        
        <Separator className="my-4" />
        
        <p className="font-medium text-gray-900">{testimonial.author}</p>
      </div>
    </Card>
  );
}
