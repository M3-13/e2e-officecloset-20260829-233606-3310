import { useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';

export async function deleteAccount(): Promise<void> {
  await apiFetch<void>('/api/auth/me', { method: 'DELETE' });
}

const headingStyle: CSSProperties = {
  fontFamily: 'var(--font-heading)',
  fontWeight: 600,
  fontSize: '20px',
  color: 'var(--color-fg)',
  margin: '0 0 var(--space-2) 0',
};

const dangerCardStyle: CSSProperties = {
  marginTop: 'var(--space-5)',
  borderColor: 'var(--color-danger)',
};

const rowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  gap: 'var(--space-3)',
  padding: 'var(--space-1) 0',
  borderBottom: '1px solid var(--color-border)',
};

const rowLabelStyle: CSSProperties = {
  color: 'var(--color-muted)',
  fontSize: '14px',
};

const errorStyle: CSSProperties = {
  color: 'var(--color-danger)',
  margin: '0 0 var(--space-3) 0',
};

const confirmStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
  alignItems: 'flex-start',
  marginTop: 'var(--space-3)',
};

const confirmActionsStyle: CSSProperties = {
  display: 'flex',
  gap: 'var(--space-2)',
  flexWrap: 'wrap',
};

export default function AccountPage() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setBusy(true);
    setError(null);
    try {
      await deleteAccount();
      logout();
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Konto konnte nicht gelöscht werden.');
      setBusy(false);
    }
  };

  return (
    <section className="page">
      <h1 className="page-title">Konto</h1>
      <p className="page-subtitle">
        Verwalte hier deine Kontodaten — einschließlich der vollständigen Löschung deines
        Kontos und aller zugehörigen Daten.
      </p>

      {loading ? (
        <p className="muted">Kontodaten werden geladen …</p>
      ) : !user ? (
        <p className="muted">Du bist nicht angemeldet.</p>
      ) : (
        <>
          <div className="card">
            <h2 style={headingStyle}>Deine Daten</h2>
            <div>
              <div style={rowStyle}>
                <span style={rowLabelStyle}>Benutzername</span>
                <span>{user.username}</span>
              </div>
              <div style={{ ...rowStyle, borderBottom: 'none' }}>
                <span style={rowLabelStyle}>E-Mail</span>
                <span>{user.email}</span>
              </div>
            </div>
          </div>

          <div className="card" style={dangerCardStyle}>
            <h2 style={{ ...headingStyle, color: 'var(--color-danger)' }}>Konto löschen</h2>
            <p className="muted">
              Das Löschen deines Kontos entfernt unwiderruflich deine Garderobe, deine
              Outfits und alle hochgeladenen Bilder. Diese Aktion kann nicht rückgängig
              gemacht werden.
            </p>

            {error ? <p style={errorStyle}>{error}</p> : null}

            {confirming ? (
              <div style={confirmStyle}>
                <p className="muted">Möchtest du dein Konto wirklich endgültig löschen?</p>
                <div style={confirmActionsStyle}>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleDelete}
                    disabled={busy}
                  >
                    {busy ? 'Wird gelöscht …' : 'Endgültig löschen'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setConfirming(false)}
                    disabled={busy}
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => setConfirming(true)}
              >
                Konto löschen
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
