import { describe, expect, it } from 'vitest';
import { isOutfitValid, itemInitial, toggleId } from './OutfitEditor';

describe('OutfitEditor helpers', () => {
  it('toggleId adds an id that is not yet selected', () => {
    expect(toggleId([1, 2], 3)).toEqual([1, 2, 3]);
  });

  it('toggleId removes an id that is already selected', () => {
    expect(toggleId([1, 2, 3], 2)).toEqual([1, 3]);
  });

  it('toggleId does not duplicate an existing id', () => {
    expect(toggleId([1, 2], 2)).toEqual([1]);
  });

  it('isOutfitValid requires a non-empty name and at least one item', () => {
    expect(isOutfitValid({ name: 'Gala-Abend', itemIds: [1, 2] })).toBe(true);
    expect(isOutfitValid({ name: '   ', itemIds: [1] })).toBe(false);
    expect(isOutfitValid({ name: 'Gala-Abend', itemIds: [] })).toBe(false);
  });

  it('itemInitial returns the first letter or a fallback', () => {
    expect(itemInitial('Rock')).toBe('R');
    expect(itemInitial('  ')).toBe('?');
    expect(itemInitial('')).toBe('?');
  });
});
