export interface ClothingItem {
  id: number;
  name: string;
  category: string;
  description: string | null;
  image_url: string | null;
}

export const WARDROBE_CATEGORIES: string[] = [
  'Oberteil',
  'Unterteil',
  'Kleid',
  'Schuhe',
  'Accessoire',
  'Jacke',
];

export function buildItemsQuery(category: string, search: string): string {
  const params = new URLSearchParams();
  const cat = category.trim();
  const query = search.trim();
  if (cat) {
    params.set('category', cat);
  }
  if (query) {
    params.set('search', query);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}
