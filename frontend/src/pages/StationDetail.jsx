import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../lib/api';
import MapView from '../components/MapView';
import { useAuth } from '../context/AuthContext';
import { socket } from '../lib/socket';

export default function StationDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [station, setStation] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedCharger, setSelectedCharger] = useState(null);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [kwh, setKwh] = useState(10);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  const load = async () => {
    const { data } = await API.get(`/stations/${id}`);
    setStation(data.station);
    setSelectedCharger(data.station.chargers[0]);
    const r = await API.get(`/reviews/station/${id}`);
    setReviews(r.data.reviews);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  useEffect(() => {
    socket.emit('subscribe:station', id);
    const onUpdate = ({ stationId, chargerId, status }) => {
      if (stationId !== id) return;
      setStation((s) => s ? {
        ...s,
        chargers: s.chargers.map((c) => String(c._id) === String(chargerId) ? { ...c, status } : c)
      } : s);
    };
    socket.on('charger:update', onUpdate);
    return () => socket.off('charger:update', onUpdate);
  }, [id]);

  const book = async () => {
    if (!user) return nav('/login');
    if (!selectedCharger || !start || !end) return toast.error('Pick a charger and time');
    try {
      const { data } = await API.post('/bookings', {
        stationId: id, chargerId: selectedCharger._id,
        startTime: start, endTime: end, estimatedKwh: Number(kwh)
      });
      toast.success(`Booked! Total ₹${data.booking.totalAmount}`);
      // Start payment
      const { data: od } = await API.post('/payments/order', { bookingId: data.booking._id });
      // Mock successful payment in demo mode
      await API.post('/payments/verify', {
        bookingId: data.booking._id,
        razorpayOrderId: od.order.id,
        razorpayPaymentId: `pay_mock_${Date.now()}`
      });
      toast.success('Payment confirmed ⚡');
      nav('/bookings');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Booking failed');
    }
  };

  const submitReview = async () => {
    if (!user) return nav('/login');
    try {
      await API.post('/reviews', { stationId: id, ...newReview });
      toast.success('Thanks for your review!');
      setNewReview({ rating: 5, comment: '' });
      load();
    } catch { toast.error('Could not submit review'); }
  };

  if (!station) return <div className="p-10 text-center text-slate-400">Loading...</div>;

  const [lng, lat] = station.location.coordinates;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <button onClick={() => nav(-1)} className="btn-ghost mb-4">← Back</button>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: info */}
        <div className="lg:col-span-3 space-y-6">
          <div className="card overflow-hidden">
            {station.imageUrl && (
              <img src={station.imageUrl} alt={station.name}
                className="w-full h-64 object-cover" />
            )}
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="font-display text-3xl font-bold">{station.name}</h1>
                  <p className="text-slate-400 text-sm mt-1">{station.address}</p>
                </div>
                <div className="chip">
                  <span className="text-amber-300">★</span> {station.rating?.toFixed(1)} ({station.totalReviews})
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {station.amenities?.map((a) => <span key={a} className="chip">✓ {a}</span>)}
                {station.open24h && <span className="chip text-emerald-300 border-emerald-400/30">24/7</span>}
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">Chargers</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {station.chargers.map((c) => {
                const active = selectedCharger?._id === c._id;
                const disabled = c.status !== 'available';
                return (
                  <button key={c._id} disabled={disabled}
                    onClick={() => setSelectedCharger(c)}
                    className={`text-left p-4 rounded-xl border transition ${
                      active ? 'border-bolt-400 bg-bolt-400/10 shadow-glow'
                        : disabled ? 'border-white/5 bg-white/5 opacity-50 cursor-not-allowed'
                        : 'border-white/10 hover:border-bolt-400/50 hover:bg-white/5'
                    }`}>
                    <div className="flex items-center justify-between">
                      <div className="font-display font-semibold">{c.type}</div>
                      <span className={`text-xs chip ${
                        c.status === 'available' ? 'text-emerald-300 border-emerald-400/30' :
                        c.status === 'in-use' ? 'text-amber-300 border-amber-400/30' :
                        'text-slate-400'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          c.status === 'available' ? 'bg-emerald-400 animate-pulse' :
                          c.status === 'in-use' ? 'bg-amber-400' : 'bg-slate-500'
                        }`}></span>
                        {c.status}
                      </span>
                    </div>
                    <div className="text-sm text-slate-400 mt-1">⚡ {c.powerKw} kW · ₹{c.pricePerKwh}/kWh</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reviews */}
          <div className="card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">Reviews</h2>
            {user && (
              <div className="space-y-3 mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2">
                  <span className="label !mb-0">Your rating:</span>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setNewReview((r) => ({ ...r, rating: n }))}
                      className={`text-xl ${n <= newReview.rating ? 'text-amber-300' : 'text-slate-600'}`}>★</button>
                  ))}
                </div>
                <textarea value={newReview.comment} onChange={(e) => setNewReview((r) => ({ ...r, comment: e.target.value }))}
                  placeholder="Share your experience..." className="input" rows={3} />
                <button onClick={submitReview} className="btn-primary">Post review</button>
              </div>
            )}
            <div className="space-y-3">
              {reviews.length === 0 && <p className="text-sm text-slate-400">No reviews yet.</p>}
              {reviews.map((r) => (
                <div key={r._id} className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{r.user?.name}</div>
                    <div className="text-amber-300 text-sm">{'★'.repeat(r.rating)}</div>
                  </div>
                  {r.comment && <p className="text-sm text-slate-300 mt-1">{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Map + booking */}
        <div className="lg:col-span-2 space-y-4">
          <MapView center={[lat, lng]} stations={[station]} height={320} />

          <div className="card p-6 sticky top-24">
            <h3 className="font-display text-lg font-semibold mb-3">Book a slot</h3>
            <label className="label">Start time</label>
            <input className="input" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
            <label className="label mt-3">End time</label>
            <input className="input" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
            <label className="label mt-3">Estimated kWh</label>
            <input className="input" type="number" min="1" value={kwh} onChange={(e) => setKwh(e.target.value)} />
            <div className="mt-4 p-3 rounded-xl bg-bolt-400/10 border border-bolt-400/30 text-sm">
              <div className="flex justify-between"><span>Charger</span><span>{selectedCharger?.type} · {selectedCharger?.powerKw}kW</span></div>
              <div className="flex justify-between"><span>Rate</span><span>₹{selectedCharger?.pricePerKwh}/kWh</span></div>
              <div className="flex justify-between mt-2 pt-2 border-t border-white/10 font-semibold">
                <span>Estimated total</span>
                <span className="gradient-text">₹{((selectedCharger?.pricePerKwh || 0) * kwh).toFixed(0)}</span>
              </div>
            </div>
            <button onClick={book} className="btn-primary w-full mt-4">
              Book & Pay →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
