import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import API from '../lib/api';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await API.get('/bookings/me');
    setBookings(data.bookings);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    try { await API.patch(`/bookings/${id}/cancel`); toast.success('Cancelled'); load(); }
    catch { toast.error('Cannot cancel'); }
  };

  const statusStyle = (s) => ({
    pending: 'text-amber-300 border-amber-400/30',
    confirmed: 'text-emerald-300 border-emerald-400/30',
    completed: 'text-bolt-300 border-bolt-400/30',
    cancelled: 'text-rose-300 border-rose-400/30'
  }[s] || 'text-slate-400');

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
      <h1 className="font-display text-3xl font-bold mb-1">My bookings</h1>
      <p className="text-slate-400 mb-6">Your recent charging sessions.</p>

      {loading && <p className="text-slate-400">Loading...</p>}
      {!loading && bookings.length === 0 && (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-3">⚡</div>
          <p className="text-slate-300">No bookings yet.</p>
          <a href="/stations" className="btn-primary mt-4 inline-flex">Find a station →</a>
        </div>
      )}

      <div className="space-y-3">
        {bookings.map((b) => (
          <div key={b._id} className="card p-4 flex flex-col md:flex-row gap-4 md:items-center">
            <div className="h-20 w-24 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
              {b.station?.imageUrl
                ? <img src={b.station.imageUrl} className="h-full w-full object-cover" />
                : <div className="h-full w-full grid place-items-center text-3xl">⚡</div>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display font-semibold">{b.station?.name}</div>
              <div className="text-xs text-slate-400">{b.station?.city}</div>
              <div className="text-xs text-slate-400 mt-1">
                {new Date(b.startTime).toLocaleString()} → {new Date(b.endTime).toLocaleTimeString()}
              </div>
            </div>
            <div className="text-right">
              <div className="gradient-text font-display font-bold text-lg">₹{b.totalAmount}</div>
              <span className={`chip ${statusStyle(b.status)} mt-1`}>{b.status}</span>
            </div>
            {['pending', 'confirmed'].includes(b.status) && (
              <button onClick={() => cancel(b._id)} className="btn-ghost !text-rose-300">Cancel</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
