import { describe, expect, it } from 'vitest';
import { buildItemsQuery, WARDROBE_CATEGORIES } from './wardrobe';

describe('buildItemsQuery', () => {
  it('returns an empty string when both filters are empty', () => {
    expect(buildItemsQuery('', '')).toBe('');
  });

  it('encodes only the category when search is empty', () => {
    expect(buildItemsQuery('Kleid', '')).toBe('?category=Kleid');
  });

  it('encodes only the search when category is empty', () => {
    expect(buildItemsQuery('', 'bluse')).toBe('?search=bluse');
  });

  it('combines category and search', () => {
    expect(buildItemsQuery('Kleid', 'rote')).toBe('?category=Kleid&search=rote');
  });

  it('ignores whitespace-only values', () => {
    expect(buildItemsQuery('   ', '  ')).toBe('');
  });
});

describe('WARDROBE_CATEGORIES', () => {
  it('contains the fixed category set', () => {
    expect(WARDROBE_CATEGORIES).toEqual([
      'Oberteil',
      'Unterteil',
      'Kleid',
      'Schuhe',
      'Accessoire',
      'Jacke',
    ]);
  });
});
