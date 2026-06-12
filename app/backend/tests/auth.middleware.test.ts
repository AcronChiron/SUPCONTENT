import { describe, it, expect, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { authenticate, requireAdmin, optionalAuth } from '../src/middlewares/auth';
import { ApiError } from '../src/utils/ApiError';

const SECRET = process.env.JWT_SECRET!;

function mkReq(headers: Record<string, string> = {}, user?: any) {
  return { headers, user } as any;
}

describe('authenticate middleware', () => {
  it('throws when header missing', () => {
    expect(() => authenticate(mkReq(), {} as any, vi.fn())).toThrow(ApiError);
  });

  it('throws when header is not Bearer', () => {
    expect(() => authenticate(mkReq({ authorization: 'Basic xyz' }), {} as any, vi.fn())).toThrow(ApiError);
  });

  it('throws on invalid token', () => {
    expect(() => authenticate(mkReq({ authorization: 'Bearer bad.token' }), {} as any, vi.fn())).toThrow(ApiError);
  });

  it('attaches payload and calls next on valid token', () => {
    const token = jwt.sign({ userId: 'u1', role: 'USER' }, SECRET);
    const req = mkReq({ authorization: `Bearer ${token}` });
    const next = vi.fn();
    authenticate(req, {} as any, next);
    expect(req.user.userId).toBe('u1');
    expect(next).toHaveBeenCalled();
  });
});

describe('optionalAuth', () => {
  it('proceeds without user if no header', () => {
    const req = mkReq();
    const next = vi.fn();
    optionalAuth(req, {} as any, next);
    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it('ignores invalid tokens silently', () => {
    const req = mkReq({ authorization: 'Bearer nope' });
    const next = vi.fn();
    optionalAuth(req, {} as any, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('requireAdmin', () => {
  it('throws for non-admin', () => {
    expect(() => requireAdmin(mkReq({}, { userId: 'u', role: 'USER' }), {} as any, vi.fn())).toThrow(ApiError);
  });
  it('passes for admin', () => {
    const next = vi.fn();
    requireAdmin(mkReq({}, { userId: 'u', role: 'ADMIN' }), {} as any, next);
    expect(next).toHaveBeenCalled();
  });
});
