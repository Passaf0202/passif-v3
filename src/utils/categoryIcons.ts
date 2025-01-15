import { 
  Briefcase, 
  Car, 
  Home, 
  Shirt, 
  Umbrella, 
  Gamepad, 
  PawPrint, 
  Laptop, 
  HeartHandshake, 
  Baby, 
  Sofa, 
  Wrench,
  Package,
  LucideIcon
} from "lucide-react";

export const getCategoryIcon = (categoryName: string): LucideIcon => {
  const normalizedName = categoryName.toLowerCase();
  
  switch (normalizedName) {
    case 'emploi':
      return Briefcase;
    case 'véhicules':
      return Car;
    case 'immobilier':
      return Home;
    case 'mode':
      return Shirt;
    case 'locations de vacances':
      return Umbrella;
    case 'loisirs':
      return Gamepad;
    case 'animaux':
      return PawPrint;
    case 'électronique':
      return Laptop;
    case 'services':
      return HeartHandshake;
    case 'famille':
      return Baby;
    case 'maison & jardin':
      return Sofa;
    case 'matériel professionnel':
      return Wrench;
    default:
      return Package;
  }
};