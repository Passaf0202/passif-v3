
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationMapProps {
  location: string;
}

export const LocationMap = ({ location }: LocationMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initializeMap = async () => {
      try {
        // Géocodage de l'adresse
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`
        );
        const data = await response.json();

        if (data && data[0]) {
          const { lat, lon } = data[0];
          
          // Initialisation de la carte
          mapRef.current = L.map(mapContainerRef.current, {
            zoomControl: false, // Désactive les contrôles de zoom par défaut
            scrollWheelZoom: false, // Désactive le zoom avec la molette
            dragging: false // Désactive le déplacement de la carte
          }).setView([lat, lon], 14);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(mapRef.current);

          // Ajout du marqueur
          L.marker([lat, lon]).addTo(mapRef.current);

          // Ajoute les contrôles de zoom dans le coin supérieur droit
          L.control.zoom({
            position: 'topright'
          }).addTo(mapRef.current);
        }
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initializeMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [location]);

  return (
    <div className="relative">
      <div 
        ref={mapContainerRef} 
        className="h-[200px] rounded-lg shadow-md" 
        style={{ zIndex: 1 }} // Force un z-index bas
      />
    </div>
  );
};
