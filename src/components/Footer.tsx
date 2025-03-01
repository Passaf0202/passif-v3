
import { Link } from "react-router-dom";
import { CurrencySelector } from "./navbar/CurrencySelector";
import { Instagram } from "lucide-react";
import DiamondViewer from "./home/DiamondViewer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const isMobile = useIsMobile();
  const [diamondState, setDiamondState] = useState<'initial' | 'confirmed'>('initial');

  // Trigger diamond animation on hover or click
  const handleDiamondInteraction = () => {
    setDiamondState('confirmed');
    setTimeout(() => setDiamondState('initial'), 2000);
  };

  // Sections organization
  const footerSections = [
    {
      title: "À propos",
      links: [
        { label: "À propos de Tradecoiner", href: "/about" },
        { label: "Comment ça marche", href: "/how-it-works" },
        { label: "Tradecoiner Pro", href: "/pro" },
        { label: "Confiance et sécurité", href: "/trust" },
      ],
    },
    {
      title: "Services",
      links: [
        { label: "Vendre", href: "/create" },
        { label: "Acheter", href: "/" },
        { label: "Vérification de l'article", href: "/verify-item" },
        { label: "Vérification de l'identité", href: "/verify-identity" },
      ],
    },
    {
      title: "Aide",
      links: [
        { label: "Centre d'aide", href: "/help" },
        { label: "Je ne connais rien aux cryptomonnaies", href: "/crypto-basics" },
        { label: "Support", href: "/support" },
        { label: "Contact", href: "/contact" },
      ],
    },
  ];

  const legalLinks = [
    { label: "Politique de Confidentialité", href: "/privacy" },
    { label: "Paramètres des cookies", href: "/cookie-settings" },
    { label: "Politique de cookies", href: "/cookie-policy" },
    { label: "Termes et Conditions", href: "/terms" },
    { label: "Notre plateforme", href: "/platform" },
    { label: "Termes et conditions de Tradecoiner Pro", href: "/pro-terms" },
  ];

  const socialLinks = [
    { 
      name: "Instagram", 
      icon: <Instagram className="h-5 w-5" />, 
      href: "https://instagram.com" 
    },
    { 
      name: "LinkedIn", 
      icon: <img src="/lovable-uploads/40a51903-bcf6-471a-939b-176b3f82fc69.png" alt="LinkedIn" className="h-5 w-5" />, 
      href: "https://linkedin.com" 
    },
    { 
      name: "Discord", 
      icon: <img src="/lovable-uploads/88790474-4911-48d4-919c-f54dad46c6d4.png" alt="Discord" className="h-5 w-5" />, 
      href: "https://discord.com" 
    },
  ];

  return (
    <footer className="bg-black text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Desktop Layout */}
        {!isMobile && (
          <div className="grid grid-cols-4 gap-8">
            {/* 3D Diamond Logo */}
            <div 
              className="flex flex-col items-center justify-center"
              onMouseEnter={handleDiamondInteraction}
              onClick={handleDiamondInteraction}
            >
              <div className="h-40 w-40 cursor-pointer">
                <DiamondViewer state={diamondState} scale={3.0} />
              </div>
              <img 
                src="/lovable-uploads/999d07e0-e58f-425b-973b-2b8d11da58f5.png" 
                alt="Tradecoiner" 
                className="mt-4 h-8"
              />
            </div>

            {/* Footer Sections */}
            {footerSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-white font-semibold text-lg mb-4">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="hover:text-white transition-colors text-gray-400"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Mobile Layout - Accordion Style */}
        {isMobile && (
          <div className="space-y-6">
            {/* 3D Diamond Logo */}
            <div 
              className="flex flex-col items-center justify-center mb-6"
              onClick={handleDiamondInteraction}
            >
              <div className="h-32 w-32 cursor-pointer">
                <DiamondViewer state={diamondState} scale={2.5} />
              </div>
              <img 
                src="/lovable-uploads/999d07e0-e58f-425b-973b-2b8d11da58f5.png" 
                alt="Tradecoiner" 
                className="mt-2 h-7"
              />
            </div>

            {/* Accordion Menu */}
            <Accordion type="single" collapsible className="w-full">
              {footerSections.map((section, index) => (
                <AccordionItem key={index} value={`section-${index}`} className="border-gray-700">
                  <AccordionTrigger className="text-white font-semibold py-3">
                    {section.title}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-3 py-2">
                      {section.links.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          <Link
                            to={link.href}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {/* Social Media Links */}
        <div className="flex justify-center mt-10 space-x-6">
          {socialLinks.map((social, index) => (
            <a 
              key={index} 
              href={social.href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label={social.name}
            >
              {social.icon}
            </a>
          ))}
        </div>

        {/* Legal Links & Copyright */}
        <div className="mt-10 pt-8 border-t border-gray-800">
          <div className="flex flex-col items-center">
            {/* Legal Links */}
            <div className="flex flex-wrap justify-center gap-4 mb-6 text-xs text-gray-400">
              {legalLinks.map((link, index) => (
                <Link 
                  key={index} 
                  to={link.href}
                  className="hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Currency Selector and Copyright */}
            <div className="flex flex-col md:flex-row items-center gap-4">
              <CurrencySelector />
              <p className="text-sm text-gray-500">
                &copy; {currentYear} Tradecoiner - Tous droits réservés
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
