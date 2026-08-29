import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadItemImage, releaseItemImage } from './wardrobeImage';

const originalFetch = globalThis.fetch;
const originalCreate = URL.createObjectURL;
const originalRevoke = URL.revokeObjectURL;

function stubImageFetch(contentType = 'image/png') {
  const mock = vi.fn().mockImplementation(async () => {
    const blob = new Blob(['img'], { type: contentType });
    return new Response(blob, {
      status: 200,
      headers: { 'content-type': contentType },
    });
  });
  globalThis.fetch = mock as unknown as typeof fetch;
  return mock;
}

describe('loadItemImage / releaseItemImage', () => {
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:mock') as unknown as typeof URL.createObjectURL;
    URL.revokeObjectURL = vi.fn() as unknown as typeof URL.revokeObjectURL;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
  });

  it('fetches the image blob over apiFetch and creates an object URL', async () => {
    const fetchMock = stubImageFetch();

    const url = await loadItemImage('/api/wardrobe/items/1/image');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [calledUrl] = fetchMock.mock.calls[0] as [string];
    expect(calledUrl).toContain('/api/wardrobe/items/1/image');
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(url).toBe('blob:mock');
  });

  it('reloads after an edit: loading the SAME image_url again yields a NEW object URL', async () => {
    const createSpy = vi
      .fn()
      .mockReturnValueOnce('blob:first')
      .mockReturnValueOnce('blob:second');
    URL.createObjectURL = createSpy as unknown as typeof URL.createObjectURL;
    stubImageFetch();

    const first = await loadItemImage('/api/wardrobe/items/7/image');
    const second = await loadItemImage('/api/wardrobe/items/7/image');

    expect(first).toBe('blob:first');
    expect(second).toBe('blob:second');
    expect(second).not.toBe(first);
  });

  it('releaseItemImage revokes the stale object URL left over from the previous load', () => {
    releaseItemImage('blob:stale');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:stale');
  });
});
