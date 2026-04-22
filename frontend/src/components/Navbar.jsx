import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();

  const linkCls = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition ${
      isActive ? 'text-bolt-300 bg-white/5' : 'text-slate-300 hover:text-white hover:bg-white/5'
    }`;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-2xl bg-ink-900/70 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-bolt-400 to-neon-green grid place-items-center shadow-glow group-hover:scale-110 transition">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-ink-900" fill="currentColor">
              <path d="M13 2 L4 14 H10 L8 22 L20 9 H13 Z" />
            </svg>
          </div>
          <div className="font-display text-xl font-bold tracking-tight">
            Electro<span className="gradient-text">Map</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" className={linkCls} end>Discover</NavLink>
          <NavLink to="/stations" className={linkCls}>Stations</NavLink>
          <NavLink to="/route" className={linkCls}>Smart Route</NavLink>
          {user && <NavLink to="/bookings" className={linkCls}>My Bookings</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin" className={linkCls}>Admin</NavLink>}
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={toggle} className="btn-ghost !px-3" title="Toggle theme">
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
          {user ? (
            <>
              <Link to="/profile" className="btn-ghost !px-3">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-bolt-400 to-neon-green text-ink-900 grid place-items-center text-xs font-bold">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span className="hidden sm:inline">{user.name}</span>
              </Link>
              <button onClick={() => { logout(); nav('/'); }} className="btn-ghost">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Login</Link>
              <Link to="/register" className="btn-primary">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
