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

  // While generating, don't show the last assistant message from DB
  // (it's either an old one being replaced, or not yet saved)
  // Instead we show a single streaming bubble after the last user message.
  const lastUserIdx = [...messages].reverse().findIndex((m) => m.role === 'user');
  const lastUserPosition = lastUserIdx >= 0 ? messages.length - 1 - lastUserIdx : -1;

  // Find the last assistant message index in DB
  const lastAssistantInDb = [...messages].reverse().findIndex((m) => m.role === 'assistant');
  const lastAssistantPosition = lastAssistantInDb >= 0 ? messages.length - 1 - lastAssistantInDb : -1;

  return (
    <Box ref={containerRef} sx={{ flex: 1, overflow: 'auto', p: 2 }}>
      {messages.map((msg, i) => {
        // Skip the last assistant in DB while generating to avoid duplicates
        const skipBecauseStreaming = isGenerating && msg.role === 'assistant' && i === lastAssistantPosition;

        if (skipBecauseStreaming) return null;

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
            {/* Insert streaming bubble after the last user message */}
            {i === lastUserPosition && isGenerating && (
              <StreamingAssistantBubble
                streamingContent={streamingContent}
                streamingReasoning={streamingReasoning}
              />
            )}
          </Box>
        );
      })}

      {/* Edge case: generating but no messages in DB yet */}
      {isGenerating && messages.length === 0 && (
        <StreamingAssistantBubble
          streamingContent={streamingContent}
          streamingReasoning={streamingReasoning}
        />
      )}

      <div ref={bottomRef} />
    </Box>
  );
}

function StreamingAssistantBubble({ streamingContent, streamingReasoning }) {
  if (!streamingContent && !streamingReasoning) {
    return <StreamingIndicator />;
  }

  return (
    <MessageBubble
      message={{ role: 'assistant', content: '', reasoningContent: '', id: '__streaming__' }}
      isStreaming
      streamingContent={streamingContent}
      streamingReasoning={streamingReasoning}
    />
  );
}
