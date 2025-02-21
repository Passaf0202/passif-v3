
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Input } from './ui/input';

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

    // Initialize map
    mapRef.current = L.map(mapContainerRef.current).setView([46.603354, 1.888334], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapRef.current);

    if (defaultLocation && !readOnly) {
      // Geocode default location
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(defaultLocation)}`)
        .then(res => res.json())
        .then(data => {
          if (data.length > 0) {
            const { lat, lon } = data[0];
            mapRef.current?.setView([lat, lon], 13);
            markerRef.current = L.marker([lat, lon], { icon: blackIcon }).addTo(mapRef.current!);
          }
        });
    }

    // Add click handler only if not readOnly
    if (!readOnly) {
      mapRef.current.on('click', (e) => {
        const { lat, lng } = e.latlng;
        
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], { icon: blackIcon }).addTo(mapRef.current!);
        }

        // Reverse geocode
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
          .then(res => res.json())
          .then(data => {
            const location = data.display_name;
            onLocationChange(location);
          });
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onLocationChange, readOnly, defaultLocation]);

  const handleAddressSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    
    const address = e.target.value;
    onLocationChange(address);

    if (address.length < 3) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await response.json();

      if (data.length > 0) {
        const { lat, lon } = data[0];
        mapRef.current?.setView([lat, lon], 13);

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lon]);
        } else {
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
          markerRef.current = L.marker([lat, lon], { icon: blackIcon }).addTo(mapRef.current!);
        }
      }
    } catch (error) {
      console.error('Error searching address:', error);
    }
  };

  return (
    <div className="space-y-4">
      {!readOnly && (
        <Input
          type="text"
          placeholder="Rechercher une adresse"
          onChange={handleAddressSearch}
        />
      )}
      <div ref={mapContainerRef} className="h-[400px] rounded-lg" />
    </div>
  );
}
