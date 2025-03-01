
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { Check } from "lucide-react";

const testimonials = [
  {
    quote: "Plateforme très sécurisante pour acheter et vendre des cryptos. Le système de vérification KYC est simple et efficace. Je l'utilise maintenant pour toutes mes transactions.",
    author: "Thomas L.",
    verified: true
  },
  {
    quote: "J'hésitais à utiliser une plateforme P2P pour mes transactions crypto. Tradecoiner m'a rassuré avec son système d'escrow. Transactions rapides et sécurisées.",
    author: "Sophie M.",
    verified: true
  },
  {
    quote: "Les frais minimes ont fait toute la différence. J'ai économisé beaucoup par rapport aux plateformes traditionnelles. Le support client est également très réactif.",
    author: "Alexandre D.",
    verified: true
  }
];

export function TestimonialsSection() {
  const isMobile = useIsMobile();
  
  return (
    <section className="py-16 bg-gray-50">
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
          <div className="flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory no-scrollbar">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="snap-center min-w-[280px] w-[85%] shrink-0">
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </div>
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
