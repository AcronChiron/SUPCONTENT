import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import { generateTokens } from '../src/services/auth';

describe('generateTokens', () => {
  it('returns valid access and refresh tokens', () => {
    const { accessToken, refreshToken } = generateTokens('user-1', 'USER');
    const access = jwt.verify(accessToken, process.env.JWT_SECRET!) as any;
    const refresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
    expect(access.userId).toBe('user-1');
    expect(access.role).toBe('USER');
    expect(refresh.userId).toBe('user-1');
  });

  it('tokens are signed with different secrets', () => {
    const { accessToken } = generateTokens('user-1', 'USER');
    expect(() => jwt.verify(accessToken, process.env.JWT_REFRESH_SECRET!)).toThrow();
  });
});
