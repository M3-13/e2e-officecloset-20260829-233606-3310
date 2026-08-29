import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiFetch } from './client';

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

function stubFetch(status: number, body: unknown, contentType = 'application/json') {
  const payload =
    contentType === 'application/json' ? JSON.stringify(body) : String(body);
  const response = new Response(status === 204 ? null : payload, {
    status,
    headers: { 'content-type': contentType },
  });
  const mock = vi.fn().mockResolvedValue(response);
  globalThis.fetch = mock as unknown as typeof fetch;
  return mock;
}

describe('apiFetch', () => {
  beforeEach(() => {
    store.clear();
    globalThis.localStorage = localStorageMock;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    globalThis.localStorage = originalLocalStorage;
  });

  it('adds the Authorization header when a token is stored', async () => {
    localStorage.setItem('token', 'test-token');
    const fetchMock = stubFetch(200, { status: 'ok' });

    const result = await apiFetch<{ status: string }>('/api/health');

    expect(result).toEqual({ status: 'ok' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://localhost:8000/api/health');
    const headers = init.headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer test-token');
  });

  it('omits the Authorization header without a token', async () => {
    const fetchMock = stubFetch(200, { status: 'ok' });

    await apiFetch('/api/health');

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Headers;
    expect(headers.get('Authorization')).toBeNull();
  });

  it('throws with the API detail message on error responses', async () => {
    stubFetch(404, { detail: 'Nicht gefunden' });

    await expect(apiFetch('/api/wardrobe/items/1')).rejects.toThrow('Nicht gefunden');
  });

  it('returns undefined for 204 No Content', async () => {
    stubFetch(204, '');

    const result = await apiFetch('/api/wardrobe/items/1');

    expect(result).toBeUndefined();
  });
});
