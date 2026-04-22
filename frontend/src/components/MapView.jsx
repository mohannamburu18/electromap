import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';

// Custom EV charging icon
const evIcon = (status = 'available') => L.divIcon({
  className: '',
  html: `<div style="
    width:32px;height:32px;border-radius:10px;
    display:grid;place-items:center;
    background:${status === 'available' ? 'linear-gradient(135deg,#22d3ee,#39ff14)' :
                 status === 'in-use' ? 'linear-gradient(135deg,#f59e0b,#ef4444)' :
                 'linear-gradient(135deg,#64748b,#334155)'};
    box-shadow:0 0 20px ${status === 'available' ? 'rgba(34,211,238,0.6)' : 'rgba(100,116,139,0.4)'};
    color:#06080c;font-weight:700;border:2px solid rgba(255,255,255,0.3);
  ">⚡</div>`,
  iconSize: [32, 32], iconAnchor: [16, 16]
});

const userIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:20px;height:20px;border-radius:999px;background:#3b82f6;
    border:3px solid white;box-shadow:0 0 0 6px rgba(59,130,246,0.3);
  "></div>`,
  iconSize: [20, 20], iconAnchor: [10, 10]
});

export default function MapView({ center, stations = [], userLocation, routePath, height = 500 }) {
  const ctr = center || (userLocation ? [userLocation.lat, userLocation.lng] : [17.4435, 78.3807]);
  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 shadow-glow" style={{ height }}>
      <MapContainer center={ctr} zoom={12} scrollWheelZoom className="map-dark h-full w-full">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userLocation && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup>You are here</Popup>
            </Marker>
            <Circle center={[userLocation.lat, userLocation.lng]} radius={500}
              pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.08 }} />
          </>
        )}
        {stations.map((s) => {
          const avail = s.chargers?.filter((c) => c.status === 'available').length || 0;
          const status = avail > 0 ? 'available' : s.chargers?.some((c) => c.status === 'in-use') ? 'in-use' : 'offline';
          const [lng, lat] = s.location.coordinates;
          return (
            <Marker key={s._id} position={[lat, lng]} icon={evIcon(status)}>
              <Popup>
                <div style={{ minWidth: 220 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{s.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>{s.address}</div>
                  <div style={{ fontSize: 12, marginTop: 6 }}>
                    ⚡ {avail}/{s.chargers?.length} available · ★ {s.rating?.toFixed(1)}
                  </div>
                  <Link to={`/stations/${s._id}`} style={{
                    display: 'inline-block', marginTop: 8, padding: '6px 12px',
                    background: 'linear-gradient(135deg,#22d3ee,#39ff14)', color: '#06080c',
                    borderRadius: 8, fontWeight: 600, fontSize: 12, textDecoration: 'none'
                  }}>View details</Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
        {routePath?.length > 1 && (
          <Polyline
            positions={routePath.map((p) => [p.lat, p.lng])}
            pathOptions={{ color: '#22d3ee', weight: 4, opacity: 0.85, dashArray: '8 6' }}
          />
        )}
      </MapContainer>
    </div>
  );
}
