import { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import MessageBubble from './MessageBubble';
import StreamingIndicator from './StreamingIndicator';

export default function MessageList({ messages, streamingContent, streamingReasoning, isGenerating }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, streamingReasoning]);

  // Find the last assistant message for streaming
  const lastAssistantIdx = [...messages].reverse().findIndex((m) => m.role === 'assistant');
  const streamingIdx = lastAssistantIdx >= 0 ? messages.length - 1 - lastAssistantIdx : -1;

  return (
    <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
      {messages.map((msg, i) => {
        const isStreamingThis = isGenerating && msg.role === 'assistant' && i === streamingIdx;
        return (
          <MessageBubble
            key={msg.id}
            message={msg}
            isStreaming={isStreamingThis}
            streamingContent={isStreamingThis ? streamingContent : ''}
            streamingReasoning={isStreamingThis ? streamingReasoning : ''}
          />
        );
      })}

      {/* New assistant message being generated (not yet saved to DB) */}
      {isGenerating && streamingIdx === -1 && streamingContent && (
        <MessageBubble
          message={{ role: 'assistant', content: '', reasoningContent: '' }}
          isStreaming
          streamingContent={streamingContent}
          streamingReasoning={streamingReasoning}
        />
      )}

      {/* Thinking indicator before any content arrives */}
      {isGenerating && !streamingContent && !streamingReasoning && (
        <StreamingIndicator />
      )}

      {/* Reasoning indicator */}
      {isGenerating && streamingReasoning && !streamingContent && streamingIdx === -1 && (
        <MessageBubble
          message={{ role: 'assistant', content: '', reasoningContent: '' }}
          isStreaming
          streamingContent=""
          streamingReasoning={streamingReasoning}
        />
      )}

      <div ref={bottomRef} />
    </Box>
  );
}
