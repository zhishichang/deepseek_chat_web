import { describe, it, expect, vi } from 'vitest';
import { parseSSEStream } from './sse.js';

function createMockResponse(chunks) {
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

  return { body: stream };
}

describe('parseSSEStream', () => {
  it('parses content delta from SSE stream', async () => {
    const chunks = ['data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n'];
    const onDelta = vi.fn();

    await parseSSEStream(createMockResponse(chunks), { onDelta });

    expect(onDelta).toHaveBeenCalledWith('Hello', '');
  });

  it('parses reasoning content from SSE stream', async () => {
    const chunks = ['data: {"choices":[{"delta":{"reasoning_content":"thinking..."}}]}\n\n'];
    const onDelta = vi.fn();

    await parseSSEStream(createMockResponse(chunks), { onDelta });

    expect(onDelta).toHaveBeenCalledWith('', 'thinking...');
  });

  it('handles data: [DONE] terminator', async () => {
    const chunks = [
      'data: {"choices":[{"delta":{"content":"Hi"}}]}\n\n',
      'data: [DONE]\n\n',
    ];
    const onDelta = vi.fn();

    await parseSSEStream(createMockResponse(chunks), { onDelta });

    expect(onDelta).toHaveBeenCalledTimes(1);
    expect(onDelta).toHaveBeenCalledWith('Hi', '');
  });

  it('calls onUsage when usage is present', async () => {
    const chunks = ['data: {"usage":{"total_tokens":42},"choices":[{"delta":{}}]}\n\n'];
    const onUsage = vi.fn();

    await parseSSEStream(createMockResponse(chunks), { onUsage });

    expect(onUsage).toHaveBeenCalledWith({ total_tokens: 42 });
  });

  it('handles multiple chunks in sequence', async () => {
    const chunks = [
      'data: {"choices":[{"delta":{"content":"He"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":"llo"}}]}\n\n',
    ];
    const onDelta = vi.fn();

    await parseSSEStream(createMockResponse(chunks), { onDelta });

    expect(onDelta).toHaveBeenCalledTimes(2);
    expect(onDelta).toHaveBeenNthCalledWith(1, 'He', '');
    expect(onDelta).toHaveBeenNthCalledWith(2, 'llo', '');
  });

  it('skips empty lines and unparseable data', async () => {
    const chunks = ['\n\ndata: not-json\n\ndata: {"choices":[{"delta":{"content":"ok"}}]}\n\n'];
    const onDelta = vi.fn();

    await parseSSEStream(createMockResponse(chunks), { onDelta });

    expect(onDelta).toHaveBeenCalledTimes(1);
    expect(onDelta).toHaveBeenCalledWith('ok', '');
  });

  it('handles chunk that splits across message boundary', async () => {
    const chunks = [
      'data: {"choices":[{"delt',
      'a":{"content":"split"}}]}\n\n',
    ];
    const onDelta = vi.fn();

    await parseSSEStream(createMockResponse(chunks), { onDelta });

    expect(onDelta).toHaveBeenCalledWith('split', '');
  });
});
