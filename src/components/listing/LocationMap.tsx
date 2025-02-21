
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationMapProps {
  location: string;
}

export const LocationMap = ({ location }: LocationMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialiser la carte avec un z-index plus bas
    const container = mapContainerRef.current;
    container.style.zIndex = '0';

    mapRef.current = L.map(mapContainerRef.current).setView([46.603354, 1.888334], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapRef.current);

    // Créer une icône personnalisée noire
    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="black"/>
      </svg>`,
      iconSize: [24, 24],
      iconAnchor: [12, 24]
    });

    // Géocodage de l'adresse pour obtenir les coordonnées
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`)
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          const { lat, lon } = data[0];
          if (mapRef.current) {
            mapRef.current.setView([lat, lon], 13);

            if (markerRef.current) {
              markerRef.current.setLatLng([lat, lon]);
            } else {
              markerRef.current = L.marker([lat, lon], { icon: customIcon }).addTo(mapRef.current);
            }
          }
        }
      })
      .catch(error => console.error('Error fetching location:', error));

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [location]);

  return (
    <>
      <style>
        {`
          .custom-marker {
            background: none;
            border: none;
          }
          .leaflet-control-container {
            display: none;
          }
        `}
      </style>
      <div ref={mapContainerRef} className="h-full w-full rounded-lg overflow-hidden relative" />
    </>
  );
};
