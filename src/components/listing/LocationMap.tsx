
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

    // Initialiser la carte
    mapRef.current = L.map(mapContainerRef.current).setView([46.603354, 1.888334], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapRef.current);

    // Géocodage de l'adresse pour obtenir les coordonnées
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`)
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          const { lat, lon } = data[0];
          mapRef.current?.setView([lat, lon], 13);

          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lon]);
          } else {
            markerRef.current = L.marker([lat, lon]).addTo(mapRef.current!);
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

  return <div ref={mapContainerRef} className="h-[200px] rounded-lg overflow-hidden" />;
};
