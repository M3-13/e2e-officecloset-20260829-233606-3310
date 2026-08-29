import { useRef, useState, type FormEvent } from 'react';
import type { ClothingItem } from '../api/wardrobe';

interface WardrobeItemFormProps {
  categories: string[];
  initial?: ClothingItem | null;
  submitting?: boolean;
  error?: string | null;
  onSubmit: (payload: FormData) => void;
  onCancel: () => void;
}

export default function WardrobeItemForm({
  categories,
  initial,
  submitting = false,
  error,
  onSubmit,
  onCancel,
}: WardrobeItemFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEdit = Boolean(initial);
  const canSubmit = name.trim().length > 0 && category.length > 0 && !submitting;

  function handleFileChange() {
    const file = fileInputRef.current?.files?.[0];
    setFileName(file ? file.name : null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('category', category);
    if (description.trim()) {
      formData.append('description', description.trim());
    }
    const file = fileInputRef.current?.files?.[0];
    if (file) {
      formData.append('image', file);
    }
    onSubmit(formData);
  }

  return (
    <form className="wardrobe-form" onSubmit={handleSubmit}>
      <label className="wardrobe-form__field">
        <span className="wardrobe-form__label">Name</span>
        <input
          className="input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="z. B. Seidenbluse"
        />
      </label>

      <label className="wardrobe-form__field">
        <span className="wardrobe-form__label">Kategorie</span>
        <select
          className="input"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="" disabled>
            Kategorie wählen
          </option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </label>

      <label className="wardrobe-form__field">
        <span className="wardrobe-form__label">Beschreibung</span>
        <textarea
          className="input wardrobe-form__textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional"
          rows={3}
        />
      </label>

      <label className="wardrobe-form__field">
        <span className="wardrobe-form__label">Bild</span>
        <input
          ref={fileInputRef}
          className="input"
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleFileChange}
        />
        {fileName && <span className="muted">{fileName}</span>}
      </label>

      {error && <p className="wardrobe-error">{error}</p>}

      <div className="wardrobe-form__actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Abbrechen
        </button>
        <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
          {isEdit ? 'Speichern' : 'Anlegen'}
        </button>
      </div>
    </form>
  );
}
