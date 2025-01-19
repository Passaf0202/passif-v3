export const formatAddress = (address: string): string => {
  // Nettoyer l'adresse
  let cleanAddress = address.trim().toLowerCase();
  
  // Ajouter le préfixe 0x si nécessaire
  if (!cleanAddress.startsWith('0x')) {
    cleanAddress = `0x${cleanAddress}`;
  }
  
  // Vérifier la longueur (42 caractères = 0x + 40 caractères hex)
  if (cleanAddress.length !== 42) {
    throw new Error(`Adresse invalide: ${cleanAddress}`);
  }
  
  // Vérifier que c'est une adresse hexadécimale valide
  if (!/^0x[0-9a-f]{40}$/i.test(cleanAddress)) {
    throw new Error(`Format d'adresse invalide: ${cleanAddress}`);
  }
  
  return cleanAddress;
};

export const validateAddress = (address: string | null | undefined): boolean => {
  if (!address) return false;
  try {
    formatAddress(address);
    return true;
  } catch {
    return false;
  }
};