import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface AuthResponse {
  access_token: string;
  token_type: string;
}

const fieldStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-1)',
};

const labelStyle: React.CSSProperties = {
  fontSize: 14,
  color: 'var(--color-muted)',
};

export default function LoginPage() {
  const { setToken, loadMe } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await apiFetch<AuthResponse>('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      setToken(res.access_token);
      await loadMe();
      navigate('/wardrobe');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Anmeldung fehlgeschlagen.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page">
      <h1 className="page-title">Anmelden</h1>
      <p className="page-subtitle">
        Melde dich an, um deine Garderobe und Outfits zu verwalten.
      </p>

      <form
        onSubmit={handleSubmit}
        noValidate
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          maxWidth: 420,
          marginTop: 'var(--space-4)',
        }}
      >
        <div style={fieldStyle}>
          <label htmlFor="login-username" style={labelStyle}>
            Benutzername
          </label>
          <input
            id="login-username"
            className="input"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div style={fieldStyle}>
          <label htmlFor="login-password" style={labelStyle}>
            Passwort
          </label>
          <input
            id="login-password"
            className="input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <p role="alert" style={{ color: 'var(--color-danger)', margin: 0 }}>
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Anmelden …' : 'Anmelden'}
        </button>

        <p style={{ color: 'var(--color-muted)', fontSize: 14, margin: 0 }}>
          Noch kein Konto?{' '}
          <Link to="/register" style={{ color: 'var(--color-accent)' }}>
            Jetzt registrieren
          </Link>
        </p>
      </form>
    </section>
  );
}
