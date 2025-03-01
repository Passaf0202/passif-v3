
import { Link } from "react-router-dom";
import { CurrencySelector } from "./navbar/CurrencySelector";
import DiamondViewer from "./home/DiamondViewer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, HelpCircle } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const isMobile = useIsMobile();
  const [diamondState] = useState<'initial'>('initial');
  const [cryptoHelpOpen, setCryptoHelpOpen] = useState(false);

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
        { 
          label: "Je ne connais rien aux cryptomonnaies", 
          href: "#",
          onClick: (e: React.MouseEvent) => {
            e.preventDefault();
            setCryptoHelpOpen(true);
          }
        },
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
      icon: <img src="/lovable-uploads/ebfb68e9-33b5-4fab-8a61-24862ea14382.png" alt="Instagram" className="h-5 w-5" />, 
      href: "https://instagram.com" 
    },
    { 
      name: "LinkedIn", 
      icon: <img src="/lovable-uploads/57cae586-02c1-4462-8fb1-b22ebfe2b90f.png" alt="LinkedIn" className="h-5 w-5" />, 
      href: "https://linkedin.com" 
    },
    { 
      name: "Discord", 
      icon: <img src="/lovable-uploads/a634bb1f-9fe2-42aa-b464-485f584f4891.png" alt="Discord" className="h-5 w-5" />, 
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
            <div className="flex flex-col items-center justify-center">
              <div className="h-40 w-40">
                <DiamondViewer state={diamondState} scale={3.0} />
              </div>
            </div>

            {/* Footer Sections */}
            {footerSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-white font-semibold text-lg mb-4">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      {link.onClick ? (
                        <button
                          onClick={link.onClick}
                          className="hover:text-white transition-colors text-gray-400 text-left w-full"
                        >
                          {link.label}
                        </button>
                      ) : (
                        <Link
                          to={link.href}
                          className="hover:text-white transition-colors text-gray-400"
                        >
                          {link.label}
                        </Link>
                      )}
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
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="h-32 w-32">
                <DiamondViewer state={diamondState} scale={2.5} />
              </div>
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
                          {link.onClick ? (
                            <button
                              onClick={link.onClick}
                              className="text-gray-400 hover:text-white transition-colors text-left w-full"
                            >
                              {link.label}
                            </button>
                          ) : (
                            <Link
                              to={link.href}
                              className="text-gray-400 hover:text-white transition-colors"
                            >
                              {link.label}
                            </Link>
                          )}
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

      {/* Dialog d'aide crypto */}
      <Dialog open={cryptoHelpOpen} onOpenChange={setCryptoHelpOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouveau dans le monde des cryptomonnaies ?</DialogTitle>
            <DialogDescription>
              Pas de souci, nous sommes là pour vous aider à comprendre et utiliser Tradecoiner facilement.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-lg mb-2">Qu'est-ce qu'un wallet crypto ?</h3>
              <p className="text-gray-700">
                Un wallet (portefeuille) est comme votre compte bancaire personnel pour vos cryptomonnaies. 
                Il vous permet de stocker, envoyer et recevoir des cryptos de façon sécurisée.
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-lg mb-2">Comment acheter sur Tradecoiner ?</h3>
              <p className="text-gray-700">
                Connectez votre wallet, choisissez un produit, et payez en quelques clics. 
                Vos fonds sont sécurisés par notre système d'escrow jusqu'à la réception de votre achat.
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-lg mb-2">Comment vendre sur Tradecoiner ?</h3>
              <p className="text-gray-700">
                Créez une annonce, ajoutez votre adresse de wallet pour recevoir les paiements.
                Dès qu'un acheteur paie, vous en êtes notifié et pouvez expédier le produit.
              </p>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setCryptoHelpOpen(false)}
              className="sm:w-auto w-full"
            >
              J'ai compris
            </Button>
            <Button 
              className="sm:w-auto w-full"
              onClick={() => window.open('/guide', '_blank')}
            >
              Guide complet <ExternalLink className="ml-1 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </footer>
  );
}
