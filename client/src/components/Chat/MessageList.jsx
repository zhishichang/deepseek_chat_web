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

  // Track if user scrolled up manually
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
      autoScrollRef.current = atBottom;
    };

    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  // Only auto-scroll if user is near bottom
  useEffect(() => {
    if (autoScrollRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingContent, streamingReasoning]);

  // Separate saved messages into user/assistant pairs for correct ordering
  // The key insight: while streaming, the new assistant message is NOT in DB yet,
  // so we need to insert the streaming bubble after the last user message.
  const lastMsgIdx = messages.length - 1;
  const lastUserIdx = [...messages].reverse().findIndex((m) => m.role === 'user');
  const lastUserPosition = lastUserIdx >= 0 ? messages.length - 1 - lastUserIdx : -1;

  // When generating, the streaming bubble should appear after the last user message
  const showStreamingAfterIdx = isGenerating ? lastUserPosition : -1;

  // Check if the last saved message is an assistant that we're streaming into (regenerate case)
  const lastAssistantIdx = [...messages].reverse().findIndex((m) => m.role === 'assistant');
  const lastAssistantPosition = lastAssistantIdx >= 0 ? messages.length - 1 - lastAssistantIdx : -1;
  const isRegenerating = isGenerating && lastAssistantPosition >= 0 && lastAssistantPosition === lastMsgIdx;

  return (
    <Box ref={containerRef} sx={{ flex: 1, overflow: 'auto', p: 2 }}>
      {messages.map((msg, i) => {
        const isStreamingThis = isGenerating && msg.role === 'assistant' && i === lastAssistantPosition;
        const isLastAssistant = msg.role === 'assistant' && i === lastAssistantPosition;

        return (
          <Box key={msg.id}>
            <MessageBubble
              message={msg}
              isStreaming={isStreamingThis}
              streamingContent={isStreamingThis ? streamingContent : ''}
              streamingReasoning={isStreamingThis ? streamingReasoning : ''}
              isLastAssistant={isLastAssistant && !isGenerating}
              onCopy={onCopy}
              onEdit={onEdit}
              onRegenerate={isLastAssistant ? onRegenerate : undefined}
            />
            {/* Insert streaming bubble right after the last user message */}
            {i === showStreamingAfterIdx && !isRegenerating && (
              <StreamingAssistantBubble
                streamingContent={streamingContent}
                streamingReasoning={streamingReasoning}
              />
            )}
          </Box>
        );
      })}

      {/* If no messages yet but generating (edge case) */}
      {isGenerating && messages.length === 0 && (
        <StreamingAssistantBubble
          streamingContent={streamingContent}
          streamingReasoning={streamingReasoning}
        />
      )}

      {/* When no stream content yet, show thinking indicator */}
      {isGenerating && !streamingContent && !streamingReasoning && !isRegenerating && (
        <StreamingIndicator />
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
