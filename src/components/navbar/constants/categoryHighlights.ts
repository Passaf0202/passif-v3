
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
  closeDelay: 300,    // Délai réduit pour une meilleure réactivité
  openDelay: 50,      // Petit délai à l'ouverture
  transitionDelay: 50 // Délai pour le changement de catégorie
};

export const MENU_ZONES = {
  safeZone: {
    top: 100,    // Plus d'espace en haut
    bottom: 150, // Plus d'espace en bas
    sides: 100   // Plus d'espace sur les côtés
  },
  categories: {
    height: 48  // Hauteur de la barre de catégories
  }
};
