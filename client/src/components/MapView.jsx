import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import StarRating from './StarRating.jsx';

// Job site pin icon (Blue)
const jobIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Worker pin icon (Orange/Amber)
const workerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function MapView({ jobLocation, workers = [], jobId }) {
  const centerLat = jobLocation?.coordinates?.[1] || 17.9689;
  const centerLng = jobLocation?.coordinates?.[0] || 79.5941;

  return (
    <div className="w-full h-full min-h-[420px] rounded-2xl overflow-hidden border border-stone-200 shadow-sm relative z-0">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Job Pin */}
        <Marker position={[centerLat, centerLng]} icon={jobIcon}>
          <Popup>
            <div className="text-xs p-1">
              <div className="font-bold text-blue-900 mb-0.5">📍 Your Job Location</div>
              <p className="text-stone-600">Work site for this request</p>
            </div>
          </Popup>
        </Marker>

        {/* Worker Pins */}
        {workers.map((worker) => {
          const coords = worker.location?.coordinates;
          if (!coords || coords.length < 2) return null;
          const lat = coords[1];
          const lng = coords[0];
          const user = worker.user || {};
          const quote = worker.estimatedQuote || worker.rate || 1000;

          return (
            <Marker key={worker._id} position={[lat, lng]} icon={workerIcon}>
              <Popup>
                <div className="p-1 min-w-[180px]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <img
                      src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&auto=format&fit=crop&q=80'}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-bold text-stone-900 text-xs">{user.name || 'Worker'}</div>
                      <div className="text-[10px] text-amber-700 font-semibold">{worker.distanceKm?.toFixed(1) || '2'} km away</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs mt-1 pt-1 border-t border-stone-200">
                    <StarRating rating={worker.ratingAvg || 4.8} size="sm" />
                    <span className="font-extrabold text-stone-900">₹{quote}</span>
                  </div>

                  {jobId && (
                    <Link
                      to={`/customer/jobs/${jobId}/book/${worker.user?._id || worker._id}`}
                      className="block text-center mt-2 px-2 py-1 bg-amber-500 text-stone-950 font-bold rounded text-[11px] hover:bg-amber-400 shadow-sm"
                    >
                      Book Worker →
                    </Link>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute top-3 right-3 z-[400] bg-white/95 backdrop-blur-md p-2 rounded-xl shadow-md border border-stone-200 text-xs space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span>
          <span className="text-stone-700 font-medium">Job Site</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
          <span className="text-stone-700 font-medium">Matched Workers ({workers.length})</span>
        </div>
      </div>
    </div>
  );
}
