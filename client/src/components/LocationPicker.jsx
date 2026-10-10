import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Fix Vite / Leaflet marker icon asset issue
const customMarkerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapClickHandler({ onLocationChange }) {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

export default function LocationPicker({
  initialLat = 17.9689,
  initialLng = 79.5941,
  addressText = '',
  onChange
}) {
  const { t } = useTranslation();
  const [coords, setCoords] = useState({ lat: initialLat, lng: initialLng });
  const [address, setAddress] = useState(addressText);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  useEffect(() => {
    if (initialLat && initialLng) {
      setCoords({ lat: initialLat, lng: initialLng });
    }
  }, [initialLat, initialLng]);

  const handleLocationUpdate = (lat, lng, newAddress = null) => {
    setCoords({ lat, lng });
    const updatedAddress = newAddress !== null ? newAddress : address;
    if (onChange) {
      onChange({ lat, lng, addressText: updatedAddress });
    }
  };

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGpsLoading(false);
        const approxAddr = address || 'Current Detected GPS Location';
        setAddress(approxAddr);
        handleLocationUpdate(latitude, longitude, approxAddr);
      },
      (error) => {
        setGpsLoading(false);
        setGpsError('Location permission denied. You can still tap on the map to set your location.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-3">
      {/* Address & GPS Actions */}
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        <div className="relative flex-1">
          <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
          <input
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              handleLocationUpdate(coords.lat, coords.lng, e.target.value);
            }}
            placeholder={t('jobForm.addressPlaceholder', 'Area / Landmark / House No in Warangal or Kazipet...')}
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
          />
        </div>

        <button
          type="button"
          onClick={handleUseGps}
          disabled={gpsLoading}
          className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <Navigation className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
          <span>{gpsLoading ? 'Detecting GPS...' : t('jobForm.useGps', 'Use My GPS')}</span>
        </button>
      </div>

      {gpsError && (
        <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* Interactive Leaflet Map Container */}
      <div className="h-64 sm:h-72 w-full rounded-2xl overflow-hidden border border-stone-300 shadow-inner relative z-0">
        <MapContainer
          center={[coords.lat, coords.lng]}
          zoom={13}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={[coords.lat, coords.lng]}
            icon={customMarkerIcon}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const pos = marker.getLatLng();
                handleLocationUpdate(pos.lat, pos.lng);
              }
            }}
          />
          <MapClickHandler onLocationChange={handleLocationUpdate} />
        </MapContainer>

        <div className="absolute bottom-2 left-2 z-[400] bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[11px] font-semibold text-stone-700 shadow border border-stone-200 pointer-events-none">
          📍 Lat: {coords.lat.toFixed(4)}, Lng: {coords.lng.toFixed(4)} • Tap map or drag pin
        </div>
      </div>
    </div>
  );
}
