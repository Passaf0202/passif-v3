
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
    if (!mapContainerRef.current || mapRef.current) return;

    // Si nous avons une localisation par défaut, géocodons-la d'abord
    if (defaultLocation) {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(defaultLocation)}`)
        .then(res => res.json())
        .then(data => {
          if (data.length > 0) {
            const { lat, lon } = data[0];
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lon);
            
            // Initialiser la carte avec la position
            mapRef.current = L.map(mapContainerRef.current).setView([latitude, longitude], 13);
            
            // Ajouter la couche de tuiles
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapRef.current);

            // Ajouter le marqueur
            L.marker([latitude, longitude])
              .addTo(mapRef.current)
              .bindPopup(defaultLocation)
              .openPopup();
          }
        })
        .catch(error => {
          console.error('Error geocoding location:', error);
        });
    }

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
        style={{ zIndex: 0 }} 
      />
    </div>
  );
}
