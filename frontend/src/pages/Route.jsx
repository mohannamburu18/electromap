import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import API from '../lib/api';
import MapView from '../components/MapView';

export default function Route() {
  const [origin, setOrigin] = useState({ lat: 17.4435, lng: 78.3807 });
  const [destination, setDestination] = useState({ lat: 17.385, lng: 78.4867 });
  const [path, setPath] = useState([]);
  const [total, setTotal] = useState(null);
  const [hop, setHop] = useState(50);
  const [stations, setStations] = useState([]);

  useEffect(() => {
    API.get('/stations').then((r) => setStations(r.data.stations || []));
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => setOrigin({ lat: p.coords.latitude, lng: p.coords.longitude }),
        () => {}, { timeout: 5000 }
      );
    }
  }, []);

  const plan = async () => {
    try {
      const { data } = await API.post('/ai/route', { origin, destination, maxHopKm: Number(hop) });
      if (!data.path?.length) return toast.error('No route — increase max hop distance');
      setPath(data.path); setTotal(data.totalDistanceKm);
      toast.success(`Route found: ${data.totalDistanceKm} km`);
    } catch { toast.error('Could not compute route'); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl md:text-4xl font-bold">🧭 Smart route planner</h1>
        <p className="text-slate-400 mt-1">AI-powered route with optimal charging stops (Dijkstra).</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5 space-y-3">
            <h3 className="font-display font-semibold">Origin</h3>
            <div className="grid grid-cols-2 gap-2">
              <input className="input" type="number" step="0.0001" value={origin.lat}
                onChange={(e) => setOrigin({ ...origin, lat: +e.target.value })} placeholder="Lat" />
              <input className="input" type="number" step="0.0001" value={origin.lng}
                onChange={(e) => setOrigin({ ...origin, lng: +e.target.value })} placeholder="Lng" />
            </div>
          </div>
          <div className="card p-5 space-y-3">
            <h3 className="font-display font-semibold">Destination</h3>
            <div className="grid grid-cols-2 gap-2">
              <input className="input" type="number" step="0.0001" value={destination.lat}
                onChange={(e) => setDestination({ ...destination, lat: +e.target.value })} placeholder="Lat" />
              <input className="input" type="number" step="0.0001" value={destination.lng}
                onChange={(e) => setDestination({ ...destination, lng: +e.target.value })} placeholder="Lng" />
            </div>
          </div>
          <div className="card p-5">
            <label className="label">Max range per leg: {hop} km</label>
            <input type="range" min="10" max="300" value={hop} onChange={(e) => setHop(e.target.value)}
              className="w-full accent-bolt-400" />
            <button onClick={plan} className="btn-primary w-full mt-4">⚡ Plan route</button>
            {total != null && (
              <div className="mt-4 p-4 rounded-xl bg-bolt-400/10 border border-bolt-400/30">
                <div className="text-sm text-slate-400">Total distance</div>
                <div className="font-display text-3xl font-bold gradient-text">{total} km</div>
                <div className="text-xs text-slate-400 mt-1">{path.length - 2} charging stop(s)</div>
              </div>
            )}
          </div>
          {path.length > 0 && (
            <div className="card p-5">
              <h3 className="font-display font-semibold mb-3">Route waypoints</h3>
              <ol className="space-y-2">
                {path.map((n, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-bolt-400 to-neon-green text-ink-900 grid place-items-center font-bold">
                      {i + 1}
                    </div>
                    <span>{n.name}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          <MapView
            center={[origin.lat, origin.lng]}
            stations={stations}
            userLocation={origin}
            routePath={path}
            height={650}
          />
        </div>
      </div>
    </div>
  );
}
