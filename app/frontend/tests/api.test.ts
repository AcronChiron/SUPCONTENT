import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { api, setToken, getToken } from '../src/services/api';

describe('api service', () => {
  beforeEach(() => {
    setToken(null);
    vi.restoreAllMocks();
  });
  afterEach(() => setToken(null));

  it('setToken / getToken round-trip', () => {
    setToken('abc');
    expect(getToken()).toBe('abc');
    expect(localStorage.getItem('accessToken')).toBe('abc');
    setToken(null);
    expect(getToken()).toBeNull();
    expect(localStorage.getItem('accessToken')).toBeNull();
  });

  it('adds Authorization header when token set', async () => {
    setToken('tok');
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await api('/users/me');

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.Authorization).toBe('Bearer tok');
    expect(init.credentials).toBe('include');
  });

  it('throws with server error message on non-OK', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: 'nope' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      }),
    ));
    await expect(api('/x')).rejects.toThrow('nope');
  });

  it('retries once after 401 using refreshed token', async () => {
    setToken('old');
    const fetchMock = vi.fn()
      // Initial request returns 401
      .mockResolvedValueOnce(new Response('{}', { status: 401, headers: { 'content-type': 'application/json' } }))
      // Refresh call
      .mockResolvedValueOnce(new Response(JSON.stringify({ accessToken: 'new' }), {
        status: 200, headers: { 'content-type': 'application/json' },
      }))
      // Retried original request
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), {
        status: 200, headers: { 'content-type': 'application/json' },
      }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await api<{ ok: boolean }>('/users/me');
    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(getToken()).toBe('new');
  });
});
