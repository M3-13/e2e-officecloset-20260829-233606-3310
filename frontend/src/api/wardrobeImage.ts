import { apiFetch } from './client';

export async function loadItemImage(imageUrl: string): Promise<string> {
  const blob = await apiFetch<Blob>(imageUrl);
  return URL.createObjectURL(blob);
}

export function releaseItemImage(objectUrl: string): void {
  URL.revokeObjectURL(objectUrl);
}
