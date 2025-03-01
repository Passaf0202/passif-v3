
import { useState } from "react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

type FAQItem = {
  question: string;
  answer: string;
};

const initialFAQs: FAQItem[] = [
  {
    question: "Comment fonctionne Tradecoiner ?",
    answer: "Tradecoiner est une plateforme qui vous permet d'acheter et de vendre des articles en utilisant des cryptomonnaies comme moyen de paiement. Notre système d'escrow sécurisé protège à la fois l'acheteur et le vendeur pendant toute la transaction."
  },
  {
    question: "Comment puis-je payer avec des cryptomonnaies ?",
    answer: "Pour payer avec des cryptomonnaies, il vous suffit de connecter votre portefeuille numérique (wallet) lors du paiement. Nous acceptons plusieurs types de cryptomonnaies et notre système convertit automatiquement les prix pour vous."
  },
  {
    question: "Est-ce que mes transactions sont sécurisées ?",
    answer: "Absolument. Toutes les transactions sur Tradecoiner sont protégées par notre système d'escrow basé sur la blockchain. Les fonds ne sont libérés au vendeur que lorsque vous confirmez avoir reçu l'article en bon état."
  },
  {
    question: "Comment puis-je vendre un article sur Tradecoiner ?",
    answer: "Pour vendre un article, créez un compte, vérifiez votre identité, puis cliquez sur 'Vendre' dans la barre de navigation. Ajoutez des photos, une description détaillée et fixez votre prix. Votre annonce sera visible par des acheteurs potentiels dans le monde entier."
  },
  {
    question: "Que faire si je rencontre un problème avec ma commande ?",
    answer: "En cas de problème, notre système de résolution des litiges vous permet de contester une transaction. Notre équipe interviendra pour examiner la situation et trouver une solution équitable pour toutes les parties."
  }
];

export function FAQSection() {
  const [faqs] = useState<FAQItem[]>(initialFAQs);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold text-gray-900">Questions fréquentes</h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl">
            Tout ce que vous devez savoir sur Tradecoiner et notre système d'achat-vente avec cryptomonnaies
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-200 last:border-0">
                <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 transition-colors text-lg font-medium text-gray-900">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 pt-0 text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        
        <div className="flex justify-center mt-10">
          <a 
            href="/help" 
            className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
          >
            Voir toutes les questions
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7" 
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
