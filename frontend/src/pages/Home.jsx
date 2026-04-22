import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import API from '../lib/api';
import StationCard from '../components/StationCard';
import { SkeletonCard } from '../components/Skeleton';

export default function Home() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/stations').then((r) => setStations(r.data.stations || [])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 p-8 md:p-16 bg-gradient-to-br from-ink-800/60 via-ink-800/30 to-bolt-900/20">
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(600px 300px at 80% 20%, rgba(34,211,238,0.4), transparent), radial-gradient(500px 300px at 10% 80%, rgba(57,255,20,0.3), transparent)'
        }} />
        <div className="relative">
          <div className="chip mb-5 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Live charger network · <span className="gradient-text font-semibold">real-time</span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
            Charge smarter.<br />
            <span className="gradient-text">Drive further.</span>
          </h1>
          <p className="mt-5 text-slate-300 max-w-2xl text-lg">
            Find EV charging stations near you, book slots in seconds, and let our AI plan
            the optimal route with charging stops along the way.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/stations" className="btn-primary">Find stations →</Link>
            <Link to="/route" className="btn-ghost">🧭 Plan a smart route</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mt-16 grid md:grid-cols-3 gap-4">
        {[
          { icon: '📡', title: 'Real-time availability', desc: 'Live socket updates. Know which chargers are free before you arrive.' },
          { icon: '🧠', title: 'AI route planning', desc: 'Dijkstra & A* algorithms pick the optimal path with charging stops.' },
          { icon: '🔋', title: 'Range prediction', desc: 'ML-powered estimate based on battery, speed, temperature, and load.' }
        ].map((f) => (
          <div key={f.title} className="card p-6 hover:bg-white/10 transition">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="font-display text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-slate-400">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Nearby stations */}
      <section className="mt-16">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold">Top stations</h2>
            <p className="text-sm text-slate-400">Curated list — sorted by rating and availability.</p>
          </div>
          <Link to="/stations" className="text-sm text-bolt-300 hover:text-bolt-200">View all →</Link>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : stations.slice(0, 6).map((s) => <StationCard key={s._id} station={s} />)}
        </div>
      </section>
    </div>
  );
}
