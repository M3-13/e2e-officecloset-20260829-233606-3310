import { useState, type CSSProperties, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterDeps {
  apiFetch: typeof apiFetch;
  setToken: (token: string | null) => void;
  loadMe: () => Promise<void>;
  navigate: (to: string) => void;
}

export async function submitRegister(
  payload: { username: string; email: string; password: string },
  deps: RegisterDeps,
): Promise<void> {
  const res = await deps.apiFetch<AuthResponse>('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  deps.setToken(res.access_token);
  await deps.loadMe();
  deps.navigate('/wardrobe');
}

const fieldStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-1)',
};

const labelStyle: CSSProperties = {
  fontSize: 14,
  color: 'var(--color-muted)',
};

export default function RegisterPage() {
  const { setToken, loadMe } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await submitRegister(
        { username, email, password },
        { apiFetch, setToken, loadMe, navigate },
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registrierung fehlgeschlagen.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page">
      <h1 className="page-title">Registrieren</h1>
      <p className="page-subtitle">
        Erstelle ein Konto und beginne, deine glamouröse Garderobe aufzubauen.
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
          <label htmlFor="register-username" style={labelStyle}>
            Benutzername
          </label>
          <input
            id="register-username"
            className="input"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div style={fieldStyle}>
          <label htmlFor="register-email" style={labelStyle}>
            E-Mail
          </label>
          <input
            id="register-email"
            className="input"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div style={fieldStyle}>
          <label htmlFor="register-password" style={labelStyle}>
            Passwort
          </label>
          <input
            id="register-password"
            className="input"
            type="password"
            autoComplete="new-password"
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
          {submitting ? 'Konto erstellen …' : 'Konto erstellen'}
        </button>

        <p style={{ color: 'var(--color-muted)', fontSize: 14, margin: 0 }}>
          Bereits registriert?{' '}
          <Link to="/login" style={{ color: 'var(--color-accent)' }}>
            Jetzt anmelden
          </Link>
        </p>
      </form>
    </section>
  );
}
