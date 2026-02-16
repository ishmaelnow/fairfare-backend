import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Pick a default center (DFW area)
const DFW = [32.7767, -96.7970];

export default function MapBackground() {
  return (
    <div className="map-bg">
      <MapContainer
        center={DFW}
        zoom={11}
        scrollWheelZoom={true}
        className="map-bg__map"
      >
        <TileLayer
          // OpenStreetMap tiles (free)
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>

      {/* Optional dark overlay for readability */}
      <div className="map-bg__shade" />
    </div>
  );
}
