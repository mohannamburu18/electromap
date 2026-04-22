import { Link } from 'react-router-dom';

export default function StationCard({ station }) {
  const avail = station.chargers?.filter((c) => c.status === 'available').length || 0;
  const total = station.chargers?.length || 0;
  const cheapest = station.chargers?.length ? Math.min(...station.chargers.map((c) => c.pricePerKwh)) : 0;
  const topPower = station.chargers?.length ? Math.max(...station.chargers.map((c) => c.powerKw)) : 0;

  return (
    <Link to={`/stations/${station._id}`} className="card p-4 flex gap-4 hover:bg-white/10 transition group">
      <div className="h-24 w-28 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 relative">
        {station.imageUrl ? (
          <img src={station.imageUrl} alt={station.name}
            className="h-full w-full object-cover group-hover:scale-110 transition duration-500" />
        ) : (
          <div className="h-full w-full grid place-items-center text-3xl">⚡</div>
        )}
        <div className="absolute top-1.5 left-1.5 chip !py-0.5 !px-2 !text-[10px] bg-ink-900/80">
          ⚡ {topPower}kW
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-display font-semibold truncate">{station.name}</h3>
            <p className="text-xs text-slate-400 truncate">{station.address}</p>
          </div>
          <div className="chip text-[11px]">
            <span className="text-amber-300">★</span> {station.rating?.toFixed(1)}
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className={`chip ${avail > 0 ? 'text-emerald-300 border-emerald-400/30' : 'text-rose-300 border-rose-400/30'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${avail > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
            {avail}/{total} available
          </span>
          <span className="chip">₹{cheapest}/kWh</span>
          {station.distanceKm != null && <span className="chip">{station.distanceKm} km</span>}
        </div>
      </div>
    </Link>
  );
}
