import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { to: '/wardrobe', label: 'Garderobe' },
  { to: '/outfits', label: 'Outfits' },
  { to: '/konto', label: 'Konto' },
  { to: '/impressum', label: 'Impressum' },
  { to: '/datenschutz', label: 'Datenschutz' },
];

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link to="/" className="wordmark">
          RED CARPET
        </Link>
        <nav className="nav">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="auth-area">
          {loading ? (
            <span className="muted">…</span>
          ) : user ? (
            <>
              <span className="auth-user">{user.username}</span>
              <button type="button" className="btn btn-secondary" onClick={handleLogout}>
                Abmelden
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Anmelden
              </Link>
              <Link to="/register" className="btn btn-primary">
                Registrieren
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
