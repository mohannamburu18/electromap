import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import API from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '' });
  const [vehicle, setVehicle] = useState({
    make: '', model: '', batteryCapacityKwh: 40, mileageKmPerKwh: 6, currentBatteryPct: 80
  });
  const [rangeResult, setRangeResult] = useState(null);
  const [distance, setDistance] = useState(100);
  const [speed, setSpeed] = useState(60);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', phone: user.phone || '' });
      if (user.vehicle) setVehicle({ ...vehicle, ...user.vehicle });
    }
    // eslint-disable-next-line
  }, [user]);

  const save = async () => {
    try {
      const { data } = await API.put('/users/me', { ...form, vehicle });
      setUser(data.user);
      toast.success('Profile saved');
    } catch { toast.error('Save failed'); }
  };

  const predict = async () => {
    const { data } = await API.post('/ai/range', {
      batteryPct: vehicle.currentBatteryPct,
      capacityKwh: vehicle.batteryCapacityKwh,
      mileageKmPerKwh: vehicle.mileageKmPerKwh,
      speedKmh: Number(speed),
      distanceKm: Number(distance)
    });
    setRangeResult(data);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-6">
      <h1 className="font-display text-3xl font-bold">Your profile</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Account</h2>
          <label className="label">Name</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <label className="label mt-3">Phone</label>
          <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <label className="label mt-3">Email</label>
          <input className="input opacity-60" value={user?.email} disabled />
          <button onClick={save} className="btn-primary mt-5">Save changes</button>
        </div>

        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Your vehicle</h2>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Make</label>
              <input className="input" value={vehicle.make} onChange={(e) => setVehicle({ ...vehicle, make: e.target.value })} /></div>
            <div><label className="label">Model</label>
              <input className="input" value={vehicle.model} onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })} /></div>
            <div><label className="label">Battery (kWh)</label>
              <input className="input" type="number" value={vehicle.batteryCapacityKwh}
                onChange={(e) => setVehicle({ ...vehicle, batteryCapacityKwh: +e.target.value })} /></div>
            <div><label className="label">Km / kWh</label>
              <input className="input" type="number" step="0.1" value={vehicle.mileageKmPerKwh}
                onChange={(e) => setVehicle({ ...vehicle, mileageKmPerKwh: +e.target.value })} /></div>
            <div className="col-span-2">
              <label className="label">Current battery: {vehicle.currentBatteryPct}%</label>
              <input type="range" min="0" max="100" value={vehicle.currentBatteryPct}
                className="w-full accent-bolt-400"
                onChange={(e) => setVehicle({ ...vehicle, currentBatteryPct: +e.target.value })} />
            </div>
          </div>
          <button onClick={save} className="btn-ghost mt-5">Save vehicle</button>
        </div>
      </div>

      {/* AI Range Predictor */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold">🔮 AI Range Predictor</h2>
          <span className="chip text-bolt-300 border-bolt-400/30">ML-powered</span>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <div><label className="label">Target distance (km)</label>
            <input className="input" type="number" value={distance} onChange={(e) => setDistance(e.target.value)} /></div>
          <div><label className="label">Avg speed (km/h)</label>
            <input className="input" type="number" value={speed} onChange={(e) => setSpeed(e.target.value)} /></div>
          <div className="flex items-end"><button onClick={predict} className="btn-primary w-full">Predict</button></div>
        </div>
        {rangeResult && (
          <div className={`mt-5 p-5 rounded-2xl border ${
            rangeResult.canReach ? 'border-emerald-400/30 bg-emerald-400/5' : 'border-rose-400/30 bg-rose-400/5'
          }`}>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-display font-bold gradient-text">{rangeResult.rangeKm}</span>
              <span className="text-sm text-slate-400">km predicted range</span>
            </div>
            <p className={`mt-2 text-sm ${rangeResult.canReach ? 'text-emerald-300' : 'text-rose-300'}`}>
              {rangeResult.canReach
                ? `✅ You can reach your destination ${distance} km away.`
                : `⚠️ You won't make it — plan a charging stop.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
