import 'express-async-errors';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';

function createMockStreamResponse(chunks) {
  const encoder = new TextEncoder();
  let index = 0;

  const stream = new ReadableStream({
    pull(controller) {
      if (index < chunks.length) {
        controller.enqueue(encoder.encode(chunks[index]));
        index++;
      } else {
        controller.close();
      }
    },
  });

  return {
    ok: true,
    status: 200,
    headers: new Map(),
    body: stream,
  };
}

describe('POST /api/chat', () => {
  let app;

  beforeEach(async () => {
    vi.resetModules();
    vi.stubGlobal('fetch', vi.fn());

    vi.doMock('../../config.js', () => ({
      DEEPSEEK_API_KEY: 'test-key',
      DEEPSEEK_API_URL: 'https://api.deepseek.com',
    }));

    const chatModule = await import('../../routes/chat.js');
    const { errorHandler } = await import('../../middleware/errorHandler.js');

    app = express();
    app.use(express.json());
    app.use('/api/chat', chatModule.default);
    app.use(errorHandler);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 400 when messages is missing', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ model: 'deepseek-chat' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('validation');
  });

  it('returns 400 when messages is empty array', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ model: 'deepseek-chat', messages: [] });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('validation');
  });

  it('forwards request to DeepSeek API', async () => {
    const mockResponse = createMockStreamResponse([]);
    mockResponse.headers.get = vi.fn().mockReturnValue(null);
    fetch.mockResolvedValue(mockResponse);

    await request(app)
      .post('/api/chat')
      .send({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'hi' }],
      });

    expect(fetch).toHaveBeenCalledWith(
      'https://api.deepseek.com/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-key',
        }),
      })
    );
  });

  it('sets SSE headers for streaming response', async () => {
    const mockResponse = createMockStreamResponse([]);
    mockResponse.headers.get = vi.fn().mockReturnValue(null);
    fetch.mockResolvedValue(mockResponse);

    const res = await request(app)
      .post('/api/chat')
      .send({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'hi' }],
        stream: true,
      });

    expect(res.headers['content-type']).toMatch(/text\/event-stream/);
  });

  it('returns 502 when DeepSeek API returns 500+', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('{"error":{"message":"internal error"}}'),
    });

    const res = await request(app)
      .post('/api/chat')
      .send({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'hi' }],
      });

    expect(res.status).toBe(502);
    expect(res.body.error).toBe('server');
  });

  it('returns 429 with retryAfter on rate limit', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 429,
      headers: { get: () => '30' },
      text: () => Promise.resolve('{"error":{"message":"rate limited"}}'),
    });

    const res = await request(app)
      .post('/api/chat')
      .send({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'hi' }],
      });

    expect(res.status).toBe(429);
    expect(res.body.error).toBe('rate_limit');
  });

  it('returns non-streaming JSON when stream=false', async () => {
    const mockJson = { choices: [{ message: { content: 'hello' } }] };
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockJson),
    });

    const res = await request(app)
      .post('/api/chat')
      .send({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'hi' }],
        stream: false,
      });

    expect(res.status).toBe(200);
    expect(res.body.choices).toBeDefined();
  });
});
