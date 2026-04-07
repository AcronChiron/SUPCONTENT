import { describe, it, expect } from 'vitest';
import { parsePagination, paginate } from '../src/utils/pagination';

describe('parsePagination', () => {
  it('returns defaults when query is empty', () => {
    const r = parsePagination({});
    expect(r.page).toBe(1);
    expect(r.perPage).toBe(20);
    expect(r.skip).toBe(0);
  });

  it('parses page and perPage', () => {
    const r = parsePagination({ page: '3', perPage: '10' });
    expect(r.page).toBe(3);
    expect(r.perPage).toBe(10);
    expect(r.skip).toBe(20);
  });

  it('caps perPage at 100', () => {
    expect(parsePagination({ perPage: '9999' }).perPage).toBe(100);
  });

  it('clamps page to minimum 1', () => {
    expect(parsePagination({ page: '-5' }).page).toBe(1);
  });

  it('falls back on non-numeric values', () => {
    const r = parsePagination({ page: 'abc', perPage: 'xyz' });
    expect(r.page).toBe(1);
    expect(r.perPage).toBe(20);
  });
});

describe('paginate', () => {
  it('wraps data with correct meta', () => {
    const r = paginate([1, 2, 3], 45, { page: 2, perPage: 20, skip: 20 });
    expect(r.data).toEqual([1, 2, 3]);
    expect(r.meta).toEqual({ total: 45, page: 2, perPage: 20, totalPages: 3 });
  });

  it('handles empty result set', () => {
    const r = paginate([], 0, { page: 1, perPage: 20, skip: 0 });
    expect(r.meta.totalPages).toBe(0);
  });
});
