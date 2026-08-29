import { useEffect, useState, type FormEvent } from 'react';
import { apiFetch } from '../api/client';

export interface ClothingItem {
  id: number;
  name: string;
  category: string;
  description: string | null;
  image_url: string | null;
}

export interface Outfit {
  id: number;
  name: string;
  items: ClothingItem[];
}

export interface OutfitDraft {
  name: string;
  itemIds: number[];
}

export function toggleId(ids: number[], id: number): number[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
}

export function isOutfitValid(draft: OutfitDraft): boolean {
  return draft.name.trim().length > 0 && draft.itemIds.length > 0;
}

export function itemInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed.charAt(0).toUpperCase() : '?';
}

function useItemImage(imageUrl: string | null): string | null {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    if (!imageUrl) {
      setSrc(null);
      return;
    }

    apiFetch<Blob>(imageUrl)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        if (active) {
          setSrc(objectUrl);
        }
      })
      .catch(() => {
        if (active) {
          setSrc(null);
        }
      });

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [imageUrl]);

  return src;
}

export function ItemImage({
  item,
  className,
}: {
  item: ClothingItem;
  className?: string;
}) {
  const src = useItemImage(item.image_url);
  return (
    <div className={className ? `item-image ${className}` : 'item-image'}>
      {src ? (
        <img className="item-image-img" src={src} alt={item.name} />
      ) : (
        <span className="item-image-fallback">{itemInitial(item.name)}</span>
      )}
    </div>
  );
}

interface OutfitEditorProps {
  items: ClothingItem[];
  initial?: Outfit | null;
  saving?: boolean;
  onSave: (draft: OutfitDraft) => void;
  onCancel: () => void;
}

export default function OutfitEditor({
  items,
  initial,
  saving = false,
  onSave,
  onCancel,
}: OutfitEditorProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [selectedIds, setSelectedIds] = useState<number[]>(
    initial ? initial.items.map((item) => item.id) : [],
  );

  const draft: OutfitDraft = { name, itemIds: selectedIds };
  const valid = isOutfitValid(draft);
  const isEditing = Boolean(initial);

  const handleToggle = (id: number) => {
    setSelectedIds((prev) => toggleId(prev, id));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!valid) {
      return;
    }
    onSave({ name: name.trim(), itemIds: selectedIds });
  };

  return (
    <form className="card editor-panel" onSubmit={handleSubmit}>
      <h2 className="editor-title">
        {isEditing ? 'Outfit bearbeiten' : 'Neues Outfit erstellen'}
      </h2>

      <div className="form-field">
        <label className="form-label" htmlFor="outfit-name">
          Name
        </label>
        <input
          id="outfit-name"
          className="input"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="z. B. Gala-Abend"
          autoFocus
        />
      </div>

      <div className="form-field">
        <span className="form-label">Kleidungsstücke</span>
        {items.length === 0 ? (
          <p className="muted">
            Deine Garderobe ist noch leer — lege zuerst Kleidungsstücke an.
          </p>
        ) : (
          <div className="editor-items-grid">
            {items.map((item) => {
              const selected = selectedIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  className={selected ? 'item-tile selected' : 'item-tile'}
                  onClick={() => handleToggle(item.id)}
                  aria-pressed={selected}
                >
                  <ItemImage item={item} />
                  <span className="item-tile-name">{item.name}</span>
                  <span className="item-tile-category">{item.category}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="editor-actions">
        <span className="muted">
          {selectedIds.length} {selectedIds.length === 1 ? 'Stück' : 'Stücke'} ausgewählt
        </span>
        <div className="editor-actions-right">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Abbrechen
          </button>
          <button type="submit" className="btn btn-primary" disabled={!valid || saving}>
            {saving ? 'Speichert…' : isEditing ? 'Speichern' : 'Outfit erstellen'}
          </button>
        </div>
      </div>
    </form>
  );
}
