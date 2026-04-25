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

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleScroll = () => {
      autoScrollRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    };
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (autoScrollRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingContent, streamingReasoning]);

  const lastUserIdx = [...messages].reverse().findIndex((m) => m.role === 'user');
  const lastUserPosition = lastUserIdx >= 0 ? messages.length - 1 - lastUserIdx : -1;

  const lastAssistantInDb = [...messages].reverse().findIndex((m) => m.role === 'assistant');
  const lastAssistantPosition = lastAssistantInDb >= 0 ? messages.length - 1 - lastAssistantInDb : -1;

  return (
    <Box ref={containerRef} sx={{ flex: 1, overflow: 'auto', p: 2 }}>
      {messages.map((msg, i) => {
        // While generating, hide the last assistant from DB to avoid duplicate
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

      {/* Single streaming/placeholder bubble at the bottom while generating */}
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
