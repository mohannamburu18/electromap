import { useEffect, useState } from 'react';
import API from '../lib/api';
import StationCard from '../components/StationCard';
import MapView from '../components/MapView';
import { SkeletonCard } from '../components/Skeleton';
import { socket } from '../lib/socket';

export default function Stations() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLoc, setUserLoc] = useState(null);
  const [filters, setFilters] = useState({ type: '', maxPrice: '', minPower: '', q: '' });

  const fetchStations = async (loc) => {
    setLoading(true);
    const params = {};
    if (loc) { params.lat = loc.lat; params.lng = loc.lng; params.radius = 100; }
    if (filters.type) params.type = filters.type;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.minPower) params.minPower = filters.minPower;
    const { data } = await API.get('/stations', { params });
    setStations(data.stations || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!navigator.geolocation) { fetchStations(); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLoc(loc); fetchStations(loc);
      },
      () => fetchStations(),
      { timeout: 6000 }
    );
    // eslint-disable-next-line
  }, []);

  useEffect(() => { fetchStations(userLoc); /* eslint-disable-next-line */ }, [filters.type, filters.maxPrice, filters.minPower]);

  useEffect(() => {
    const onUpdate = ({ stationId, chargerId, status }) => {
      setStations((prev) => prev.map((s) => {
        if (s._id !== stationId) return s;
        return { ...s, chargers: s.chargers.map((c) => String(c._id) === String(chargerId) ? { ...c, status } : c) };
      }));
    };
    socket.on('charger:update', onUpdate);
    return () => socket.off('charger:update', onUpdate);
  }, []);

  const filtered = stations.filter((s) =>
    !filters.q || s.name.toLowerCase().includes(filters.q.toLowerCase())
      || s.address?.toLowerCase().includes(filters.q.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl md:text-4xl font-bold">Find a station</h1>
        <p className="text-slate-400 mt-1">Filter, search, and tap a pin to see details.</p>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 grid md:grid-cols-5 gap-3">
        <input className="input md:col-span-2" placeholder="Search by name or address..."
          value={filters.q} onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))} />
        <select className="input" value={filters.type}
          onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}>
          <option value="">All types</option>
          <option>AC</option><option>DC</option><option>CCS</option><option>CHAdeMO</option><option>Type2</option>
        </select>
        <input className="input" type="number" placeholder="Max ₹/kWh"
          value={filters.maxPrice} onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))} />
        <input className="input" type="number" placeholder="Min kW"
          value={filters.minPower} onChange={(e) => setFilters((f) => ({ ...f, minPower: e.target.value }))} />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 order-2 lg:order-1 space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : filtered.length === 0
              ? <div className="card p-8 text-center text-slate-400">No stations match your filters.</div>
              : filtered.map((s) => <StationCard key={s._id} station={s} />)}
        </div>
        <div className="lg:col-span-2 order-1 lg:order-2">
          <div className="sticky top-24">
            <MapView stations={filtered} userLocation={userLoc} height={600} />
          </div>
        </div>
      </div>
    </div>
  );
}
