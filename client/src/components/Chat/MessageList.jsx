import { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import MessageBubble from './MessageBubble';
import StreamingIndicator from './StreamingIndicator';

export default function MessageList({
  messages,
  streamingContent,
  streamingReasoning,
  isGenerating,
  onCopy,
  onEdit,
  onRegenerate,
}) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const autoScrollRef = useRef(true);
  const userScrolledRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
      autoScrollRef.current = atBottom;
      if (!atBottom) {
        userScrolledRef.current = true;
      }
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll only when new messages arrive (not every streaming token)
  // and only if user hasn't scrolled up
  useEffect(() => {
    if (!autoScrollRef.current) return;
    const el = containerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length]);

  // While streaming, only stick to bottom if we were already at bottom
  // Use direct scrollTop assignment instead of scrollIntoView to avoid animation queue
  useEffect(() => {
    if (!autoScrollRef.current) return;
    const el = containerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [streamingContent, streamingReasoning]);

  // Reset user scroll flag when generation ends
  useEffect(() => {
    if (!isGenerating) {
      userScrolledRef.current = false;
    }
  }, [isGenerating]);

  const lastUserIdx = [...messages].reverse().findIndex((m) => m.role === 'user');
  const lastUserPosition = lastUserIdx >= 0 ? messages.length - 1 - lastUserIdx : -1;

  const lastAssistantInDb = [...messages].reverse().findIndex((m) => m.role === 'assistant');
  const lastAssistantPosition = lastAssistantInDb >= 0 ? messages.length - 1 - lastAssistantInDb : -1;

  return (
    <Box ref={containerRef} sx={{ flex: 1, overflow: 'auto', p: 2 }}>
      {messages.map((msg, i) => {
        if (isGenerating && msg.role === 'assistant' && i === lastAssistantPosition) {
          return null;
        }

        const isLastAssistant = msg.role === 'assistant' && i === lastAssistantPosition;

        return (
          <Box key={msg.id}>
            <MessageBubble
              message={msg}
              isStreaming={false}
              streamingContent=""
              streamingReasoning=""
              isLastAssistant={isLastAssistant && !isGenerating}
              onCopy={onCopy}
              onEdit={onEdit}
              onRegenerate={isLastAssistant ? onRegenerate : undefined}
            />
          </Box>
        );
      })}

      {isGenerating && (
        <MessageBubble
          message={{ role: 'assistant', content: '', reasoningContent: '', id: '__streaming__' }}
          isStreaming
          streamingContent={streamingContent}
          streamingReasoning={streamingReasoning}
        />
      )}

      <div ref={bottomRef} />
    </Box>
  );
}
