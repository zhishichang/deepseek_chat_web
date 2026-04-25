import { useRef, useCallback } from 'react';
import { parseSSEStream } from '../utils/sse';

export default function useStreaming() {
  const abortRef = useRef(null);

  const startStream = useCallback(async (body, { onDelta, onUsage, onDone, onError }) => {
    // Abort any existing stream
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'unknown', message: `HTTP ${response.status}` }));
        throw err;
      }

      if (body.stream) {
        await parseSSEStream(response, {
          onDelta,
          onUsage,
          signal: controller.signal,
        });
      } else {
        const json = await response.json();
        const content = json.choices?.[0]?.message?.content || '';
        const reasoningContent = json.choices?.[0]?.message?.reasoning_content || '';
        onDelta?.(content, reasoningContent);
        if (json.usage) onUsage?.(json.usage);
      }

      onDone?.();
    } catch (err) {
      if (err.name === 'AbortError' || controller.signal.aborted) {
        onDone?.();
        return;
      }
      onError?.(err);
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    }
  }, []);

  const stopStream = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  return { startStream, stopStream, isStreaming: () => Boolean(abortRef.current) };
}
