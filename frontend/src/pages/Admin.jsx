import { useEffect, useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import toast from 'react-hot-toast';
import API from '../lib/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const chartOpts = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { labels: { color: '#94a3b8' } } },
  scales: {
    x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
    y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
  }
};

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stations, setStations] = useState([]);
  const [tab, setTab] = useState('overview');

  const load = async () => {
    const [s, u, b, st] = await Promise.all([
      API.get('/admin/stats'), API.get('/admin/users'),
      API.get('/bookings'), API.get('/stations')
    ]);
    setStats(s.data); setUsers(u.data.users);
    setBookings(b.data.bookings); setStations(st.data.stations);
  };
  useEffect(() => { load(); }, []);

  const deleteStation = async (id) => {
    if (!confirm('Delete this station?')) return;
    try { await API.delete(`/stations/${id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  const toggleCharger = async (sid, cid, status) => {
    try { await API.patch(`/stations/${sid}/chargers/${cid}`, { status }); load(); }
    catch { toast.error('Update failed'); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Admin dashboard</h1>
          <p className="text-slate-400 mt-1">Manage stations, users, and monitor the network.</p>
        </div>
        <span className="chip text-bolt-300 border-bolt-400/30">LIVE</span>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            ['Users', stats.users, '👥'],
            ['Stations', stats.stations, '⚡'],
            ['Bookings', stats.bookings, '📅'],
            ['Revenue', `₹${(stats.revenue || 0).toLocaleString()}`, '💰']
          ].map(([label, val, icon]) => (
            <div key={label} className="card p-5 relative overflow-hidden">
              <div className="absolute top-3 right-3 text-2xl opacity-30">{icon}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">{label}</div>
              <div className="font-display text-3xl font-bold mt-1 gradient-text">{val}</div>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      {stats && (
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="card p-5">
            <h3 className="font-display font-semibold mb-3">Bookings last 7 days</h3>
            <div style={{ height: 240 }}>
              <Line data={{
                labels: stats.daily.map((d) => d.date.slice(5)),
                datasets: [{
                  label: 'Bookings', data: stats.daily.map((d) => d.count),
                  borderColor: '#22d3ee', backgroundColor: 'rgba(34,211,238,0.15)',
                  fill: true, tension: 0.4, pointBackgroundColor: '#39ff14'
                }]
              }} options={chartOpts} />
            </div>
          </div>
          <div className="card p-5">
            <h3 className="font-display font-semibold mb-3">Peak hour demand</h3>
            <div style={{ height: 240 }}>
              <Bar data={{
                labels: stats.peak.map((p) => `${p.hour}h`),
                datasets: [{
                  label: 'Demand', data: stats.peak.map((p) => p.demand),
                  backgroundColor: stats.peak.map((p) =>
                    p.demand > 70 ? '#ff2bd6' : p.demand > 40 ? '#22d3ee' : '#39ff14')
                }]
              }} options={chartOpts} />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {['stations', 'users', 'bookings'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`btn ${tab === t ? 'btn-primary' : 'btn-ghost'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'stations' && (
        <div className="space-y-3">
          {stations.map((s) => (
            <div key={s._id} className="card p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-display font-semibold">{s.name}</div>
                  <div className="text-xs text-slate-400">{s.address}</div>
                </div>
                <button onClick={() => deleteStation(s._id)} className="btn-danger !py-1.5 !text-xs">Delete</button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {s.chargers.map((c) => (
                  <div key={c._id} className="chip !px-3 !py-1.5">
                    {c.type} · {c.powerKw}kW ·
                    <select value={c.status} onChange={(e) => toggleCharger(s._id, c._id, e.target.value)}
                      className="bg-transparent ml-1 outline-none">
                      <option className="bg-ink-800">available</option>
                      <option className="bg-ink-800">in-use</option>
                      <option className="bg-ink-800">offline</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-slate-400">
                <th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th><th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3 text-slate-400">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`chip !text-[10px] ${u.role === 'admin' ? 'text-neon-green border-neon-green/30' : ''}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'bookings' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-slate-400">
                <th className="px-4 py-3">User</th><th className="px-4 py-3">Station</th>
                <th className="px-4 py-3">Time</th><th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3">{b.user?.name}</td>
                  <td className="px-4 py-3">{b.station?.name}</td>
                  <td className="px-4 py-3 text-slate-400">{new Date(b.startTime).toLocaleString()}</td>
                  <td className="px-4 py-3">₹{b.totalAmount}</td>
                  <td className="px-4 py-3"><span className="chip">{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
