import { describe, it, expect, vi } from 'vitest';
import { requestLock } from '../../middleware/requestLock.js';

function createMockReqRes() {
  const req = {};
  const res = {
    on: vi.fn(),
    end: vi.fn(),
  };
  return { req, res };
}

describe('requestLock', () => {
  it('calls next()', () => {
    const { req, res } = createMockReqRes();
    const next = vi.fn();

    requestLock(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('attaches abortController to req', () => {
    const { req, res } = createMockReqRes();
    requestLock(req, res, vi.fn());

    expect(req.abortController).toBeDefined();
    expect(req.abortController.abort).toBeTypeOf('function');
  });

  it('aborts previous stream when new request arrives', () => {
    const first = createMockReqRes();
    const second = createMockReqRes();

    requestLock(first.req, first.res, vi.fn());

    const firstAbort = first.req.abortController;
    const abortSpy = vi.spyOn(firstAbort, 'abort');

    requestLock(second.req, second.res, vi.fn());

    expect(abortSpy).toHaveBeenCalled();
    expect(first.res.end).toHaveBeenCalled();
  });

  it('registers close handler on res', () => {
    const { req, res } = createMockReqRes();
    requestLock(req, res, vi.fn());

    expect(res.on).toHaveBeenCalledWith('close', expect.any(Function));
  });
});
