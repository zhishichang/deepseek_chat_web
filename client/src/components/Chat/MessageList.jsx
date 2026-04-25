import { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import MessageBubble from './MessageBubble';
import StreamingIndicator from './StreamingIndicator';

export default function MessageList({ messages, streamingContent, streamingReasoning, isGenerating }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, streamingReasoning]);

  return (
    <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
      {messages.map((msg, i) => {
        const isLastAssistant = msg.role === 'assistant' && i === messages.length - 1;
        return (
          <MessageBubble
            key={msg.id}
            message={msg}
            isStreaming={isGenerating && isLastAssistant && !streamingReasoning}
            streamingContent={streamingContent}
          />
        );
      })}

      {/* Show reasoning indicator while model is thinking */}
      {isGenerating && streamingReasoning && !streamingContent && (
        <StreamingIndicator reasoning />
      )}

      {/* Show streaming content bubble (assistant response in progress) */}
      {isGenerating && streamingContent && (
        <MessageBubble
          message={{ role: 'assistant', content: '' }}
          isStreaming
          streamingContent={streamingContent}
        />
      )}

      {/* Show thinking indicator at the start before any content */}
      {isGenerating && !streamingReasoning && !streamingContent && (
        <StreamingIndicator />
      )}

      <div ref={bottomRef} />
    </Box>
  );
}
