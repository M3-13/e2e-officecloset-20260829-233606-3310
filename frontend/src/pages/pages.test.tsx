import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { deleteAccount } from './AccountPage';
import ImpressumPage from './ImpressumPage';
import DatenschutzPage from './DatenschutzPage';

const store = new Map<string, string>();

const localStorageMock: Storage = {
  get length() {
    return store.size;
  },
  key(index: number): string | null {
    return Array.from(store.keys())[index] ?? null;
  },
  getItem(key: string): string | null {
    return store.has(key) ? store.get(key)! : null;
  },
  setItem(key: string, value: string): void {
    store.set(key, value);
  },
  removeItem(key: string): void {
    store.delete(key);
  },
  clear(): void {
    store.clear();
  },
};

const originalFetch = globalThis.fetch;
const originalLocalStorage = globalThis.localStorage;

describe('deleteAccount', () => {
  beforeEach(() => {
    store.clear();
    globalThis.localStorage = localStorageMock;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    globalThis.localStorage = originalLocalStorage;
  });

  it('sends a DELETE request to /api/auth/me', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 204 }));
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(deleteAccount()).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://localhost:8000/api/auth/me');
    expect(init.method).toBe('DELETE');
  });

  it('propagates an error when the request fails', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ detail: 'Nicht autorisiert' }), {
          status: 401,
          headers: { 'content-type': 'application/json' },
        }),
      );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(deleteAccount()).rejects.toThrow('Nicht autorisiert');
  });
});

describe('legal pages', () => {
  it('renders the Impressum page with provider and contact details', () => {
    const html = renderToStaticMarkup(<ImpressumPage />);
    expect(html).toContain('Impressum');
    expect(html).toContain('Anbieter');
    expect(html).toContain('Haftung für Inhalte');
  });

  it('renders the Datenschutz page with data-processing information', () => {
    const html = renderToStaticMarkup(<DatenschutzPage />);
    expect(html).toContain('Datenschutz');
    expect(html).toContain('Verantwortlicher');
    expect(html).toContain('Konto löschen');
  });
});
