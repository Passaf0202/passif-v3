
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationMapProps {
  location: string;
}

export const LocationMap = ({ location }: LocationMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initializeMap = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`
        );
        const data = await response.json();

        if (data && data[0]) {
          const { lat, lon } = data[0];
          
          mapRef.current = L.map(mapContainerRef.current).setView([lat, lon], 14);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(mapRef.current);

          // Créer une icône personnalisée avec un texte "Mark"
          const customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `
              <div style="
                background-color: white;
                border: 2px solid #3b82f6;
                border-radius: 4px;
                padding: 4px 8px;
                font-size: 12px;
                font-weight: 500;
                color: #1e40af;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              ">
                Mark
              </div>
            `,
            iconSize: [50, 30],
            iconAnchor: [25, 15]
          });

          // Ajouter le marqueur avec l'icône personnalisée
          markerRef.current = L.marker([lat, lon], { icon: customIcon }).addTo(mapRef.current);
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
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, [location]);

  return (
    <div className="relative">
      <div 
        ref={mapContainerRef} 
        className="h-[300px] rounded-lg shadow-md"
        style={{ zIndex: 1 }}
      />
      <style>
        {`
          .leaflet-container {
            z-index: 1;
          }
          .leaflet-pane {
            z-index: 1;
          }
          .leaflet-top,
          .leaflet-bottom {
            z-index: 1;
          }
          .custom-div-icon {
            background: none;
            border: none;
          }
        `}
      </style>
    </div>
  );
};
