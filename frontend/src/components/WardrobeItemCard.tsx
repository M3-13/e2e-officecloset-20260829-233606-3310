import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import type { ClothingItem } from '../api/wardrobe';

interface WardrobeItemCardProps {
  item: ClothingItem;
  onEdit: (item: ClothingItem) => void;
  onDelete: (item: ClothingItem) => void;
}

function WardrobeImage({ item }: { item: ClothingItem }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    const imageUrl = item.image_url;
    if (!imageUrl) {
      setUrl(null);
      return;
    }

    void (async () => {
      try {
        const blob = await apiFetch<Blob>(imageUrl);
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      } catch {
        if (!cancelled) setUrl(null);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [item.id, item.image_url]);

  if (url) {
    return <img className="wardrobe-card__image" src={url} alt={item.name} />;
  }

  return (
    <div className="wardrobe-card__image wardrobe-card__image--empty">
      <span className="wardrobe-card__monogram">
        {item.name.trim().charAt(0).toUpperCase() || '?'}
      </span>
    </div>
  );
}

export default function WardrobeItemCard({
  item,
  onEdit,
  onDelete,
}: WardrobeItemCardProps) {
  return (
    <article className="wardrobe-card">
      <WardrobeImage item={item} />
      <div className="wardrobe-card__body">
        <h3 className="wardrobe-card__name">{item.name}</h3>
        <span className="wardrobe-card__category">{item.category}</span>
        {item.description && (
          <p className="wardrobe-card__description">{item.description}</p>
        )}
      </div>
      <div className="wardrobe-card__actions">
        <button type="button" className="btn btn-secondary" onClick={() => onEdit(item)}>
          Bearbeiten
        </button>
        <button type="button" className="btn btn-danger" onClick={() => onDelete(item)}>
          Löschen
        </button>
      </div>
    </article>
  );
}
