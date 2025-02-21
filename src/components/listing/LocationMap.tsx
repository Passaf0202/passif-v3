
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

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

          // Créer une icône personnalisée avec un pin noir
          const customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `
              <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
              ">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 32]
          });

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
