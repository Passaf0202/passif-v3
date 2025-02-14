
import { CategoryHighlight } from "../types/categories";

export const CATEGORY_HIGHLIGHTS: Record<string, CategoryHighlight> = {
  "Véhicules": {
    brands: ["Peugeot", "Renault", "Volkswagen", "BMW", "Mercedes", "Audi"],
    sections: ["Voitures", "Motos", "Caravaning", "Utilitaires"],
    types: [],
    services: []
  },
  "Mode": {
    brands: [],
    sections: ["Vêtements", "Chaussures", "Accessoires", "Montres & Bijoux"],
    types: ["Femme", "Homme", "Enfant"],
    services: []
  },
  "Immobilier": {
    brands: [],
    sections: [],
    types: ["Vente", "Location", "Colocation", "Bureaux & Commerces"],
    services: ["Évaluation immobilière", "Diagnostic"]
  }
};

export const TIMING = {
  closeDelay: 300,    // Délai plus long pour éviter les fermetures accidentelles
  openDelay: 0,       // Pas de délai pour plus de réactivité
  transitionDelay: 150 // Transition douce
};

export const MENU_ZONES = {
  safeZone: {
    top: 96,      // Hauteur de la navbar
    bottom: 300,  // Large zone en bas pour faciliter la sortie
    sides: 100    // Zone latérale raisonnable
  },
  categories: {
    height: 48,   // Hauteur de la barre de catégories
    buffer: 40    // Zone tampon plus grande au-dessus des catégories
  }
};
