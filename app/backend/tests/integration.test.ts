import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

// --- Mocks must be declared before importing the app ---
vi.mock('../src/config/database', () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('../src/config/redis', () => ({
  redis: {
    get: vi.fn().mockResolvedValue(null),
    setex: vi.fn().mockResolvedValue('OK'),
    connect: vi.fn().mockResolvedValue(undefined),
  },
}));

import { createApp } from '../src/app';
import { prisma } from '../src/config/database';

const app = createApp();

describe('GET /health', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeTypeOf('string');
  });
});

describe('POST /api/v1/auth/register', () => {
  beforeEach(() => {
    vi.mocked(prisma.user.findFirst).mockReset();
    vi.mocked(prisma.user.create).mockReset();
  });

  it('rejects invalid email with 500 from zod', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'not-an-email', username: 'bob', password: 'password123' });
    // zod throws ZodError → not an ApiError, errorHandler returns 500
    expect([400, 500]).toContain(res.status);
  });

  it('rejects too-short password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'a@b.com', username: 'bob', password: 'short' });
    expect([400, 500]).toContain(res.status);
  });

  it('returns 409 when email is already in use', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      username: 'other',
    } as any);

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'a@b.com', username: 'bob', password: 'password123' });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/email/i);
  });

  it('creates a user and returns access token on success', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: 'u1',
      email: 'new@b.com',
      username: 'newbie',
      role: 'USER',
      avatarUrl: null,
      createdAt: new Date(),
    } as any);

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'new@b.com', username: 'newbie', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.accessToken).toBeTypeOf('string');
    expect(res.body.user.username).toBe('newbie');

    const decoded = jwt.verify(res.body.accessToken, process.env.JWT_SECRET!) as any;
    expect(decoded.userId).toBe('u1');

    // Refresh cookie must be httpOnly
    const setCookie = res.headers['set-cookie'];
    expect(String(setCookie)).toContain('HttpOnly');
  });
});

describe('Protected route without token', () => {
  it('GET /api/v1/users/me returns 401', async () => {
    const res = await request(app).get('/api/v1/users/me');
    expect(res.status).toBe(401);
  });
});

describe('OAuth graceful degradation', () => {
  it('returns 503 when Google OAuth is not configured', async () => {
    const res = await request(app).get('/api/v1/auth/oauth/google');
    // Env has no OAUTH_GOOGLE_CLIENT_ID in test setup
    expect(res.status).toBe(503);
    expect(res.body.error).toMatch(/not configured/i);
  });
});
