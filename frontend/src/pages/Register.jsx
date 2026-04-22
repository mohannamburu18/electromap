import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await register(form); toast.success('Account created ⚡'); nav('/'); }
    catch (e) { toast.error(e.response?.data?.error || 'Signup failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] grid place-items-center px-4">
      <div className="card w-full max-w-md p-8">
        <h1 className="font-display text-3xl font-bold">Create account</h1>
        <p className="text-slate-400 text-sm mt-1">Join the network. Charge smarter.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div><label className="label">Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div><label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <div><label className="label">Password</label>
            <input className="input" type="password" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create account →'}
          </button>
        </form>
        <p className="text-sm text-slate-400 mt-4 text-center">
          Have an account? <Link to="/login" className="text-bolt-300">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
