
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
  closeDelay: 200,    // Plus réactif
  openDelay: 0,       // Pas de délai pour plus de réactivité
  transitionDelay: 150 // Transition plus douce
};

export const MENU_ZONES = {
  safeZone: {
    top: 150,     // Plus d'espace en haut
    bottom: 200,  // Plus d'espace en bas
    sides: 150    // Plus d'espace sur les côtés
  },
  categories: {
    height: 48,   // Hauteur de la barre de catégories
    buffer: 20    // Zone tampon au-dessus des catégories
  }
};
