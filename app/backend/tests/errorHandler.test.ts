import { describe, it, expect, vi } from 'vitest';
import { errorHandler } from '../src/middlewares/errorHandler';
import { ApiError } from '../src/utils/ApiError';

function mockRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('errorHandler', () => {
  it('maps ApiError to its status code', () => {
    const res = mockRes();
    errorHandler(ApiError.notFound('gone'), {} as any, res, () => {});
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'gone' });
  });

  it('returns 500 for unknown errors', () => {
    const res = mockRes();
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    errorHandler(new Error('boom'), {} as any, res, () => {});
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    spy.mockRestore();
  });
});
