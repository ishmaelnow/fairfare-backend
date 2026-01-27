import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './RideMap.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icons
const pickupIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const dropoffIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const driverIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

function MapBoundsUpdater({ bounds }) {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [bounds, map]);

  return null;
}

export function RideMap({
  pickupLat,
  pickupLng,
  dropoffLat,
  dropoffLng,
  driverLat,
  driverLng,
  pickupAddress,
  dropoffAddress,
  height = '400px',
  className = '',
}) {
  const boundsRef = useRef(null);

  useEffect(() => {
    const points = [];
    
    if (pickupLat && pickupLng) {
      points.push([pickupLat, pickupLng]);
    }
    if (dropoffLat && dropoffLng) {
      points.push([dropoffLat, dropoffLng]);
    }
    if (driverLat && driverLng) {
      points.push([driverLat, driverLng]);
    }

    if (points.length > 0) {
      boundsRef.current = L.latLngBounds(points);
    } else {
      boundsRef.current = null;
    }
  }, [pickupLat, pickupLng, dropoffLat, dropoffLng, driverLat, driverLng]);

  const defaultCenter = pickupLat && pickupLng 
    ? [pickupLat, pickupLng]
    : [32.7767, -96.7970]; // Default to Dallas

  if (!pickupLat || !pickupLng) {
    return (
      <div className={`ride-map-placeholder ${className}`} style={{ height }}>
        <div className="ride-map-placeholder-content">
          <div className="ride-map-placeholder-icon">📍</div>
          <p>Map will appear when locations are available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`ride-map-container ${className}`} style={{ height }}>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapBoundsUpdater bounds={boundsRef.current} />

        {pickupLat && pickupLng && (
          <Marker position={[pickupLat, pickupLng]} icon={pickupIcon}>
            <Popup>
              <div className="ride-map-popup">
                <div className="ride-map-popup-title pickup">📍 Pickup</div>
                {pickupAddress && <div className="ride-map-popup-address">{pickupAddress}</div>}
              </div>
            </Popup>
          </Marker>
        )}

        {dropoffLat && dropoffLng && (
          <Marker position={[dropoffLat, dropoffLng]} icon={dropoffIcon}>
            <Popup>
              <div className="ride-map-popup">
                <div className="ride-map-popup-title dropoff">📍 Dropoff</div>
                {dropoffAddress && <div className="ride-map-popup-address">{dropoffAddress}</div>}
              </div>
            </Popup>
          </Marker>
        )}

        {driverLat && driverLng && (
          <Marker position={[driverLat, driverLng]} icon={driverIcon}>
            <Popup>
              <div className="ride-map-popup">
                <div className="ride-map-popup-title driver">🚗 Driver</div>
                <div className="ride-map-popup-address">Current location</div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}


