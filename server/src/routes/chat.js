import { Router } from 'express';
import { requestLock } from '../middleware/requestLock.js';
import { createChatCompletion } from '../services/deepseek.js';
import { ApiError } from '../middleware/errorHandler.js';

const router = Router();

router.post('/', requestLock, async (req, res) => {
  const { model = 'deepseek-chat', messages, temperature, max_tokens, stream = true } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw new ApiError(400, 'validation', 'messages is required and must be a non-empty array');
  }

  const body = { model, messages, stream };
  if (temperature !== undefined) body.temperature = temperature;
  if (max_tokens !== undefined) body.max_tokens = max_tokens;

  try {
    const upstream = await createChatCompletion(body);

    if (!upstream.ok) {
      const errBody = await upstream.text();
      let errJson;
      try { errJson = JSON.parse(errBody); } catch { errJson = null; }

      if (upstream.status === 429) {
        throw new ApiError(429, 'rate_limit', errJson?.error?.message || 'Rate limit exceeded');
      }
      if (upstream.status === 401 || upstream.status === 403) {
        throw new ApiError(upstream.status, 'auth', 'Invalid API key. Check server configuration.');
      }
      if (upstream.status >= 500) {
        throw new ApiError(502, 'server', 'DeepSeek API is unavailable. Please try again later.');
      }
      throw new ApiError(upstream.status, 'upstream', errJson?.error?.message || `Upstream error: ${upstream.status}`);
    }

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');

      const reader = upstream.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process complete SSE messages (separated by \n\n)
          let boundary;
          while ((boundary = buffer.indexOf('\n\n')) !== -1) {
            const message = buffer.slice(0, boundary);
            buffer = buffer.slice(boundary + 2);

            // Skip empty lines
            const lines = message.split('\n');
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;

              if (trimmed === 'data: [DONE]') {
                // Signal end of stream
                res.write('data: [DONE]\n\n');
                continue;
              }

              if (trimmed.startsWith('data: ')) {
                const jsonStr = trimmed.slice(6);
                try {
                  const parsed = JSON.parse(jsonStr);
                  // Extract usage if present and forward as custom event
                  if (parsed.usage) {
                    res.write(`event: usage\ndata: ${JSON.stringify(parsed.usage)}\n\n`);
                  }
                } catch {
                  // Not valid JSON, forward anyway
                }
                // Forward the original data line
                res.write(`${trimmed}\n\n`);
              }
            }
          }
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Stream error:', err.message);
        }
      } finally {
        res.write('event: done\ndata: {}\n\n');
        res.end();
      }
    } else {
      const json = await upstream.json();
      res.json(json);
    }
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err.name === 'AbortError') {
      res.end();
      return;
    }
    throw new ApiError(503, 'network', 'Could not reach DeepSeek API.');
  }
});

export default router;
