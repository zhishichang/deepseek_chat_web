import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import tokensRouter from '../../routes/tokens.js';
import { errorHandler } from '../../middleware/errorHandler.js';

const app = express();
app.use(express.json());
app.use('/api/count-tokens', tokensRouter);
app.use(errorHandler);

describe('POST /api/count-tokens', () => {
  it('returns token count for valid messages', async () => {
    const res = await request(app)
      .post('/api/count-tokens')
      .send({ messages: [{ role: 'user', content: 'Hello world' }] });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token_count');
    expect(res.body.token_count).toBeGreaterThan(0);
  });

  it('returns 400 when messages is not an array', async () => {
    const res = await request(app)
      .post('/api/count-tokens')
      .send({ messages: 'not an array' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('validation');
  });

  it('handles empty messages array', async () => {
    const res = await request(app)
      .post('/api/count-tokens')
      .send({ messages: [] });

    expect(res.status).toBe(200);
    expect(res.body.token_count).toBe(0);
  });

  it('handles messages with empty content', async () => {
    const res = await request(app)
      .post('/api/count-tokens')
      .send({ messages: [{ role: 'user', content: '' }] });

    expect(res.status).toBe(200);
    expect(res.body.token_count).toBe(4); // overhead only
  });

  it('counts tokens across multiple messages', async () => {
    const single = await request(app)
      .post('/api/count-tokens')
      .send({ messages: [{ role: 'user', content: 'Hello' }] });

    const double = await request(app)
      .post('/api/count-tokens')
      .send({ messages: [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there' },
      ] });

    expect(double.body.token_count).toBeGreaterThan(single.body.token_count);
  });
});
