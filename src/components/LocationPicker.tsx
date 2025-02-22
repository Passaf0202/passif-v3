import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Input } from './ui/input';

interface LocationPickerProps {
  onLocationChange: (location: string) => void;
}

export function LocationPicker({ onLocationChange }: LocationPickerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    mapRef.current = L.map(mapContainerRef.current).setView([46.603354, 1.888334], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapRef.current);

    // Add click handler
    mapRef.current.on('click', (e) => {
      const { lat, lng } = e.latlng;
      
      // Update marker position
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(mapRef.current!);
      }

      // Reverse geocode to get address
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(res => res.json())
        .then(data => {
          const location = data.display_name;
          onLocationChange(location);
        });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onLocationChange]);

  const handleAddressSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
          markerRef.current = L.marker([lat, lon]).addTo(mapRef.current!);
        }
      }
    } catch (error) {
      console.error('Error searching address:', error);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Rechercher une adresse"
        onChange={handleAddressSearch}
      />
      <div ref={mapContainerRef} className="h-[400px] rounded-lg" />
    </div>
  );
}