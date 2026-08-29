import { useCallback, useEffect, useState } from 'react';
import OutfitEditor, {
  ItemImage,
  type ClothingItem,
  type Outfit,
  type OutfitDraft,
} from '../components/OutfitEditor';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';
import './outfits.css';

function OutfitDetailModal({ outfit, onClose }: { outfit: Outfit; onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-label={outfit.name}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Schließen"
        >
          ×
        </button>
        <h2 className="modal-title">{outfit.name}</h2>
        <div className="modal-items">
          {outfit.items.map((item) => (
            <div key={item.id} className="modal-item">
              <ItemImage item={item} />
              <div className="modal-item-info">
                <span className="modal-item-name">{item.name}</span>
                <span className="muted">{item.category}</span>
                {item.description && (
                  <p className="muted modal-item-desc">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OutfitsPage() {
  const { user, loading: authLoading } = useAuth();

  const [items, setItems] = useState<ClothingItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingOutfit, setEditingOutfit] = useState<Outfit | null>(null);
  const [viewingOutfit, setViewingOutfit] = useState<Outfit | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [wardrobeItems, savedOutfits] = await Promise.all([
        apiFetch<ClothingItem[]>('/api/wardrobe/items'),
        apiFetch<Outfit[]>('/api/outfits'),
      ]);
      setItems(wardrobeItems);
      setOutfits(savedOutfits);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Outfits konnten nicht geladen werden.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (!user) {
      setLoading(false);
      setError('Bitte melde dich an, um deine Outfits zu verwalten.');
      return;
    }
    void loadData();
  }, [authLoading, user, loadData]);

  const openCreate = () => {
    setEditingOutfit(null);
    setEditorOpen(true);
  };

  const openView = (outfit: Outfit) => {
    setViewingOutfit(outfit);
  };

  const openEdit = (outfit: Outfit) => {
    setEditingOutfit(outfit);
    setViewingOutfit(null);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditingOutfit(null);
  };

  const handleSave = async (draft: OutfitDraft) => {
    setSaving(true);
    setError(null);
    try {
      if (editingOutfit) {
        await apiFetch<Outfit>(`/api/outfits/${editingOutfit.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: draft.name, item_ids: draft.itemIds }),
        });
      } else {
        await apiFetch<Outfit>('/api/outfits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: draft.name, item_ids: draft.itemIds }),
        });
      }
      closeEditor();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Speichern fehlgeschlagen.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (outfit: Outfit) => {
    if (!window.confirm(`Outfit „${outfit.name}“ wirklich löschen?`)) {
      return;
    }
    setError(null);
    try {
      await apiFetch(`/api/outfits/${outfit.id}`, { method: 'DELETE' });
      if (viewingOutfit?.id === outfit.id) {
        setViewingOutfit(null);
      }
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Löschen fehlgeschlagen.');
    }
  };

  return (
    <section className="page">
      <div className="outfits-header">
        <div>
          <h1 className="page-title">Outfits</h1>
          <p className="page-subtitle">
            Kombiniere deine Lieblingsstücke zu glamourösen Outfits — dein Lookbook-Manager.
          </p>
        </div>
        {user && (
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            Neues Outfit
          </button>
        )}
      </div>

      {error && (
        <div className="error-banner" role="alert">
          {error}
        </div>
      )}

      {editorOpen && (
        <OutfitEditor
          items={items}
          initial={editingOutfit}
          saving={saving}
          onSave={handleSave}
          onCancel={closeEditor}
        />
      )}

      {loading ? (
        <p className="muted">Lade Outfits…</p>
      ) : outfits.length === 0 ? (
        <div className="empty-state">
          <p className="muted">Noch keine Outfits gespeichert.</p>
          <p className="muted">Erstelle dein erstes Outfit aus deiner Garderobe.</p>
        </div>
      ) : (
        <div className="outfits-grid">
          {outfits.map((outfit) => (
            <article key={outfit.id} className="card outfit-card">
              <h2 className="outfit-card-name">{outfit.name}</h2>
              <div className="outfit-card-items">
                {outfit.items.slice(0, 4).map((item) => (
                  <ItemImage key={item.id} item={item} className="outfit-thumb" />
                ))}
              </div>
              <p className="muted outfit-card-count">
                {outfit.items.length} {outfit.items.length === 1 ? 'Stück' : 'Stücke'}
              </p>
              <div className="outfit-card-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => openView(outfit)}
                >
                  Anzeigen
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => openEdit(outfit)}
                >
                  Bearbeiten
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleDelete(outfit)}
                >
                  Löschen
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {viewingOutfit && (
        <OutfitDetailModal outfit={viewingOutfit} onClose={() => setViewingOutfit(null)} />
      )}
    </section>
  );
}
