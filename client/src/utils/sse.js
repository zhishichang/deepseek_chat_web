/**
 * Parse an SSE stream from a fetch Response.
 * Calls onDelta(content, reasoningContent) for each content chunk.
 * Calls onUsage(usage) when usage event is received.
 * Returns a promise that resolves when the stream ends.
 */
export async function parseSSEStream(response, { onDelta, onUsage, signal }) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      if (signal?.aborted) {
        reader.cancel();
        break;
      }

      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let boundary;
      while ((boundary = buffer.indexOf('\n\n')) !== -1) {
        const message = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);

        for (const line of message.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;

          if (trimmed.startsWith('event: usage')) {
            // Next data line will contain usage JSON; handled below
            continue;
          }

          if (trimmed.startsWith('data: ')) {
            const jsonStr = trimmed.slice(6);
            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.usage) {
                onUsage?.(parsed.usage);
              }
              const delta = parsed.choices?.[0]?.delta;
              if (delta) {
                if (delta.reasoning_content) {
                  onDelta?.('', delta.reasoning_content);
                }
                if (delta.content) {
                  onDelta?.(delta.content, '');
                }
              }
            } catch {
              // skip unparseable lines
            }
          }
        }
      }
    }
  } catch (err) {
    if (err.name !== 'AbortError' && !signal?.aborted) {
      throw err;
    }
  }
}
