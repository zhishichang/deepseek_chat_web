import { describe, it, expect, vi } from 'vitest';
import { errorHandler, ApiError } from '../../middleware/errorHandler.js';

function createMockRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res;
}

describe('ApiError', () => {
  it('creates error with status, type, message', () => {
    const err = new ApiError(400, 'validation', 'bad request');
    expect(err.status).toBe(400);
    expect(err.type).toBe('validation');
    expect(err.message).toBe('bad request');
    expect(err.name).toBe('Error');
  });

  it('supports optional retryAfter', () => {
    const err = new ApiError(429, 'rate_limit', 'too many', 30);
    expect(err.retryAfter).toBe(30);
  });
});

describe('errorHandler', () => {
  it('handles ApiError with correct status and body', () => {
    const err = new ApiError(400, 'validation', 'bad request');
    const req = {};
    const res = createMockRes();
    const next = vi.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'validation',
      message: 'bad request',
    });
  });

  it('handles AbortError with 499 status', () => {
    const err = new Error('aborted');
    err.name = 'AbortError';
    const req = {};
    const res = createMockRes();

    errorHandler(err, req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(499);
    expect(res.json).toHaveBeenCalledWith({
      error: 'aborted',
      message: 'Request was aborted',
    });
  });

  it('defaults to 500 for unknown errors', () => {
    const err = new Error('something broke');
    const req = {};
    const res = createMockRes();

    errorHandler(err, req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'server',
      message: 'something broke',
    });
  });

  it('includes retryAfter when present', () => {
    const err = new ApiError(429, 'rate_limit', 'too many', 30);
    const res = createMockRes();

    errorHandler(err, {}, res, vi.fn());

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ retryAfter: 30 })
    );
  });
});
