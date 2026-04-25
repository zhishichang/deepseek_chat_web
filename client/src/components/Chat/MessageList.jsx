import { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import MessageBubble from './MessageBubble';

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
  const autoScrollRef = useRef(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleScroll = () => {
      autoScrollRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!autoScrollRef.current) return;
    const el = containerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length, streamingContent, streamingReasoning]);

  // Determine if last DB message is assistant (regenerate scenario)
  const lastMsg = messages[messages.length - 1];
  const lastIsAssistant = lastMsg?.role === 'assistant';

  // In regenerate: the last saved message is an old assistant response
  // that will be replaced, so hide it while streaming.
  // In normal send: the last saved message is the user's new message,
  // so all DB messages should be visible.
  const hideLastAssistant = isGenerating && lastIsAssistant;

  const lastAssistantIdx = hideLastAssistant
    ? [...messages].reverse().findIndex((m) => m.role === 'assistant')
    : -1;
  const lastAssistantPosition = lastAssistantIdx >= 0
    ? messages.length - 1 - lastAssistantIdx
    : -1;

  return (
    <Box ref={containerRef} sx={{ flex: 1, overflow: 'auto', p: 2 }}>
      {messages.map((msg, i) => {
        const isHidden = hideLastAssistant && msg.role === 'assistant' && i === lastAssistantPosition;
        if (isHidden) return null;

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

      {/* Streaming bubble always at the bottom while generating */}
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
