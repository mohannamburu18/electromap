import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('demo@electromap.io');
  const [password, setPassword] = useState('demo1234');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(email, password);
      toast.success(`Welcome back, ${u.name}`);
      nav(u.role === 'admin' ? '/admin' : '/');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] grid place-items-center px-4">
      <div className="card w-full max-w-md p-8">
        <h1 className="font-display text-3xl font-bold">Welcome back</h1>
        <p className="text-slate-400 text-sm mt-1">Sign in to book stations and track bookings.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div><label className="label">Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><label className="label">Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>
        <p className="text-sm text-slate-400 mt-4 text-center">
          Don't have an account? <Link to="/register" className="text-bolt-300 hover:text-bolt-200">Create one</Link>
        </p>
        <div className="mt-6 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400">
          <div className="font-semibold text-slate-300 mb-1">Demo accounts</div>
          User: demo@electromap.io / demo1234<br />
          Admin: admin@electromap.io / admin123
        </div>
      </div>
    </div>
  );
}
