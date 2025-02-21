
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
    if (!mapContainerRef.current || !defaultLocation) return;

    // Créer et initialiser la carte immédiatement avec une vue par défaut
    if (mapRef.current) {
      mapRef.current.remove();
    }
    
    mapRef.current = L.map(mapContainerRef.current).setView([48.8566, 2.3522], 14); // Paris par défaut

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapRef.current);

    // Définir l'icône du marqueur en forme de pin noir
    const pinIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="black" stroke="black">
              <path d="M12 0c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z"/>
            </svg>`,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24]
    });

    // Géocodage de l'adresse
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(defaultLocation)}`)
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          const { lat, lon } = data[0];
          const latitude = parseFloat(lat);
          const longitude = parseFloat(lon);
          
          mapRef.current?.setView([latitude, longitude], 14);
          L.marker([latitude, longitude], { icon: pinIcon }).addTo(mapRef.current!);
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
        className="h-[400px] rounded-lg relative z-0" 
      />
    </div>
  );
}
