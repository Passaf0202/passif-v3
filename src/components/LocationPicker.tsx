
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationPickerProps {
  onLocationChange: (location: string) => void;
  readOnly?: boolean;
  defaultLocation?: string;
}

export function LocationPicker({ onLocationChange, readOnly = false, defaultLocation }: LocationPickerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Si la carte existe déjà, on la supprime pour la recréer
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Vérifier que le conteneur existe et qu'on a une localisation par défaut
    if (!mapContainerRef.current || !defaultLocation) return;

    console.log('Initialisation de la carte avec la localisation:', defaultLocation);

    // Géocoder la localisation
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(defaultLocation)}`)
      .then(res => res.json())
      .then(data => {
        console.log('Résultat du géocodage:', data);
        if (data.length > 0) {
          const { lat, lon } = data[0];
          const latitude = parseFloat(lat);
          const longitude = parseFloat(lon);
          
          console.log('Coordonnées trouvées:', latitude, longitude);
          
          // Initialiser la carte
          mapRef.current = L.map(mapContainerRef.current!).setView([latitude, longitude], 14);
          
          // Ajouter la couche de tuiles
          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(mapRef.current);

          // Créer une icône noire personnalisée pour le marqueur
          const blackIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: black; width: 20px; height: 20px; border-radius: 50%; transform: translate(-50%, -50%)"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });

          // Ajouter le marqueur
          L.marker([latitude, longitude], { icon: blackIcon })
            .addTo(mapRef.current);
        }
      })
      .catch(error => {
        console.error('Erreur lors du géocodage:', error);
      });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [defaultLocation]);

  return (
    <div className="space-y-4">
      {defaultLocation && (
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          </svg>
          <span>{defaultLocation}</span>
        </div>
      )}
      <div 
        ref={mapContainerRef} 
        className="h-[400px] rounded-lg relative" 
      />
    </div>
  );
}
