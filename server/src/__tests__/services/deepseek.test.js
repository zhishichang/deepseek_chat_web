import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('createChatCompletion', () => {
  let createChatCompletion;

  beforeEach(async () => {
    vi.resetModules();
    vi.stubGlobal('fetch', vi.fn());
    const mod = await import('../../services/deepseek.js');
    createChatCompletion = mod.createChatCompletion;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends POST to DeepSeek API with correct URL', async () => {
    const mockResponse = { ok: true, status: 200 };
    fetch.mockResolvedValue(mockResponse);

    const body = { model: 'deepseek-chat', messages: [{ role: 'user', content: 'hi' }] };
    await createChatCompletion(body);

    expect(fetch).toHaveBeenCalledWith(
      'https://api.deepseek.com/chat/completions',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('includes Authorization header with API key', async () => {
    fetch.mockResolvedValue({ ok: true });

    await createChatCompletion({ model: 'deepseek-chat', messages: [] });

    const [, options] = fetch.mock.calls[0];
    expect(options.headers).toHaveProperty('Authorization');
    expect(options.headers['Authorization']).toMatch(/^Bearer /);
  });

  it('sends body as JSON string', async () => {
    fetch.mockResolvedValue({ ok: true });

    const body = { model: 'deepseek-chat', messages: [{ role: 'user', content: 'test' }] };
    await createChatCompletion(body);

    const [, options] = fetch.mock.calls[0];
    expect(JSON.parse(options.body)).toEqual(body);
  });

  it('returns the raw response object', async () => {
    const mockResponse = { ok: true, status: 200, body: 'stream' };
    fetch.mockResolvedValue(mockResponse);

    const result = await createChatCompletion({ model: 'deepseek-chat', messages: [] });
    expect(result).toBe(mockResponse);
  });
});
