import 'express-async-errors';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';

describe('GET /api/models', () => {
  let app;

  beforeEach(async () => {
    vi.resetModules();
    vi.stubGlobal('fetch', vi.fn());

    const modelsModule = await import('../../routes/models.js');
    const { errorHandler } = await import('../../middleware/errorHandler.js');

    app = express();
    app.use(express.json());
    app.use('/api/models', modelsModule.default);
    app.use(errorHandler);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns models from DeepSeek API', async () => {
    const mockData = { data: [{ id: 'deepseek-chat', object: 'model' }] };
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const res = await request(app).get('/api/models');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id).toBe('deepseek-chat');
  });

  it('returns 502 when DeepSeek API fails', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
    });

    const res = await request(app).get('/api/models');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('upstream');
  });

  it('caches responses within TTL', async () => {
    const mockData = { data: [{ id: 'deepseek-chat' }] };
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    await request(app).get('/api/models');
    await request(app).get('/api/models');

    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
