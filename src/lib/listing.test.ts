import { describe, expect, it } from 'vitest';
import { countWord } from './listing-words';

describe('countWord', () => {
  it('writes small counts as words', () => {
    expect(countWord(4)).toBe('four');
    expect(countWord(5, true)).toBe('Five');
  });
  it('falls back to digits past ten', () => {
    expect(countWord(12)).toBe('12');
  });
});
