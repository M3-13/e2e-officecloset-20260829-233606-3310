import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  buildItemsQuery,
  WARDROBE_CATEGORIES,
  type ClothingItem,
} from '../api/wardrobe';
import WardrobeItemCard from '../components/WardrobeItemCard';
import WardrobeItemForm from '../components/WardrobeItemForm';
import '../styles/wardrobe.css';

export default function WardrobePage() {
  const { user, loading: authLoading } = useAuth();

  const [categories, setCategories] = useState<string[]>(WARDROBE_CATEGORIES);
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [category, setCategory] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<ClothingItem | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deletingItem, setDeletingItem] = useState<ClothingItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const cats = await apiFetch<string[]>('/api/wardrobe/categories');
        if (!cancelled && Array.isArray(cats) && cats.length > 0) {
          setCategories(cats);
        }
      } catch {
        // Keep the fixed fallback list.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  const loadItems = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch<ClothingItem[]>(
        `/api/wardrobe/items${buildItemsQuery(category, debouncedSearch)}`,
      );
      setItems(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Laden fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  }, [user, category, debouncedSearch]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  function openCreate() {
    setEditingItem(null);
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(item: ClothingItem) {
    setEditingItem(item);
    setFormError(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingItem(null);
    setFormError(null);
  }

  async function handleSubmit(payload: FormData) {
    setSubmitting(true);
    setFormError(null);
    try {
      if (editingItem) {
        await apiFetch<ClothingItem>(`/api/wardrobe/items/${editingItem.id}`, {
          method: 'PUT',
          body: payload,
        });
      } else {
        await apiFetch<ClothingItem>('/api/wardrobe/items', {
          method: 'POST',
          body: payload,
        });
      }
      setFormOpen(false);
      setEditingItem(null);
      await loadItems();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Speichern fehlgeschlagen');
    } finally {
      setSubmitting(false);
    }
  }

  function requestDelete(item: ClothingItem) {
    setDeleteError(null);
    setDeletingItem(item);
  }

  function cancelDelete() {
    setDeletingItem(null);
    setDeleteError(null);
  }

  async function confirmDelete() {
    if (!deletingItem) return;
    setDeleteError(null);
    try {
      await apiFetch(`/api/wardrobe/items/${deletingItem.id}`, { method: 'DELETE' });
      setDeletingItem(null);
      await loadItems();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Löschen fehlgeschlagen');
    }
  }

  if (authLoading) {
    return (
      <section className="page">
        <h1 className="page-title">Garderobe</h1>
        <p className="muted">…</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="page">
        <h1 className="page-title">Garderobe</h1>
        <p className="page-subtitle">Melde dich an, um deine Garderobe zu verwalten.</p>
        <p>
          <Link to="/login" className="btn btn-primary">
            Anmelden
          </Link>
        </p>
      </section>
    );
  }

  return (
    <section className="page">
      <h1 className="page-title">Garderobe</h1>
      <p className="page-subtitle">
        Verwalte deine Kleidungsstücke — filtern, durchsuchen, anlegen und bearbeiten.
      </p>

      <div className="wardrobe-toolbar">
        <input
          className="input wardrobe-toolbar__search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nach Namen suchen"
          aria-label="Nach Namen suchen"
        />
        <select
          className="input wardrobe-toolbar__select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Nach Kategorie filtern"
        >
          <option value="">Alle Kategorien</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          Neu anlegen
        </button>
      </div>

      {loading ? (
        <p className="muted">Wird geladen…</p>
      ) : error ? (
        <p className="wardrobe-error">{error}</p>
      ) : items.length === 0 ? (
        <div className="wardrobe-empty">
          <p>Noch keine Kleidungsstücke gefunden.</p>
          {category || debouncedSearch ? (
            <p className="muted">Passe Filter oder Suche an.</p>
          ) : (
            <p className="muted">Lege dein erstes Kleidungsstück an.</p>
          )}
        </div>
      ) : (
        <div className="wardrobe-grid">
          {items.map((item) => (
            <WardrobeItemCard
              key={item.id}
              item={item}
              onEdit={openEdit}
              onDelete={requestDelete}
            />
          ))}
        </div>
      )}

      {formOpen && (
        <div className="wardrobe-modal-overlay">
          <div className="wardrobe-modal">
            <h2 className="wardrobe-modal__title">
              {editingItem ? 'Kleidungsstück bearbeiten' : 'Neues Kleidungsstück'}
            </h2>
            <WardrobeItemForm
              key={editingItem ? editingItem.id : 'new'}
              categories={categories}
              initial={editingItem}
              submitting={submitting}
              error={formError}
              onSubmit={handleSubmit}
              onCancel={closeForm}
            />
          </div>
        </div>
      )}

      {deletingItem && (
        <div className="wardrobe-modal-overlay">
          <div className="wardrobe-modal">
            <h2 className="wardrobe-modal__title">Wirklich löschen?</h2>
            <p>
              Möchtest du „{deletingItem.name}“ wirklich löschen? Dieser Schritt kann
              nicht rückgängig gemacht werden.
            </p>
            {deleteError && <p className="wardrobe-error">{deleteError}</p>}
            <div className="wardrobe-modal__actions">
              <button type="button" className="btn btn-secondary" onClick={cancelDelete}>
                Abbrechen
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
