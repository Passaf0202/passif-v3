
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
  closeDelay: 800,    // Augmenté à 800ms pour plus de fluidité
  openDelay: 0,       // Pas de délai pour l'ouverture
  transitionDelay: 150 // Transition douce
};

export const MENU_ZONES = {
  safeZone: {
    top: 96,      // Hauteur de la navbar
    bottom: 100,  // Réduit de 300 à 100
    sides: 50     // Réduit de 100 à 50
  },
  categories: {
    height: 48,   // Hauteur de la barre de catégories
    buffer: 20    // Réduit de 40 à 20
  }
};
