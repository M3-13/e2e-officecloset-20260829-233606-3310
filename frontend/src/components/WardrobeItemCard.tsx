import { useEffect, useState } from 'react';
import { loadItemImage, releaseItemImage } from '../api/wardrobeImage';
import type { ClothingItem } from '../api/wardrobe';

interface WardrobeItemCardProps {
  item: ClothingItem;
  onEdit: (item: ClothingItem) => void;
  onDelete: (item: ClothingItem) => void;
}

function WardrobeImage({ item }: { item: ClothingItem }) {
  const [url, setUrl] = useState<string | null>(null);

  // Depend on the whole `item` object: after a PUT replaces the image, the path
  // (image_url) stays identical, so `[id, image_url]` would NOT re-run and the
  // stale object URL would stay visible. A new item reference (the page refetches
  // the list after create/edit/delete) must reload the image.
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
        const next = await loadItemImage(imageUrl);
        if (cancelled) {
          releaseItemImage(next);
          return;
        }
        objectUrl = next;
        setUrl(next);
      } catch {
        if (!cancelled) setUrl(null);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) releaseItemImage(objectUrl);
    };
  }, [item]);

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
