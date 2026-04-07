import { describe, it, expect } from 'vitest';
import { ApiError } from '../src/utils/ApiError';

describe('ApiError', () => {
  it('badRequest returns 400', () => {
    const e = ApiError.badRequest('nope');
    expect(e.statusCode).toBe(400);
    expect(e.message).toBe('nope');
    expect(e).toBeInstanceOf(Error);
  });

  it('unauthorized returns 401', () => {
    expect(ApiError.unauthorized().statusCode).toBe(401);
  });

  it('forbidden returns 403', () => {
    expect(ApiError.forbidden().statusCode).toBe(403);
  });

  it('notFound returns 404', () => {
    expect(ApiError.notFound().statusCode).toBe(404);
  });

  it('conflict returns 409', () => {
    expect(ApiError.conflict().statusCode).toBe(409);
  });

  it('tooMany returns 429', () => {
    expect(ApiError.tooMany().statusCode).toBe(429);
  });
});
