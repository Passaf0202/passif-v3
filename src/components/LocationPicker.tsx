
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
  const markerRef = useRef<L.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const blackIcon = new L.Icon({
      iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        </svg>
      `),
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });

    mapRef.current = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: !readOnly
    });

    // Ensure map container and controls have lower z-index
    mapContainerRef.current.style.zIndex = "0";
    const zoomControl = document.querySelector('.leaflet-control-zoom');
    if (zoomControl) {
      (zoomControl as HTMLElement).style.zIndex = "0";
    }

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapRef.current);

    // If we have a default location, center the map on it
    if (defaultLocation) {
      console.log('Geocoding location:', defaultLocation);
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(defaultLocation)}`)
        .then(res => res.json())
        .then(data => {
          console.log('Geocoding response:', data);
          if (data.length > 0) {
            const { lat, lon } = data[0];
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lon);
            
            console.log('Setting view to:', latitude, longitude);
            mapRef.current?.setView([latitude, longitude], 14);
            
            if (markerRef.current) {
              markerRef.current.setLatLng([latitude, longitude]);
            } else {
              markerRef.current = L.marker([latitude, longitude], { 
                icon: blackIcon 
              }).addTo(mapRef.current!);
            }
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
  }, [defaultLocation, readOnly]);

  return (
    <div 
      ref={mapContainerRef} 
      className="h-[400px] rounded-lg relative" 
      style={{ 
        zIndex: 0,
        isolation: 'isolate'
      }} 
    />
  );
}
