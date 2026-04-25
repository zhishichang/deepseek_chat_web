import Box from '@mui/material/Box';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import MarkdownRenderer from '../Markdown/MarkdownRenderer';
import ThinkingBlock from '../Markdown/ThinkingBlock';

export default function MessageBubble({ message, isStreaming, streamingContent, streamingReasoning }) {
  const isUser = message.role === 'user';
  const content = isStreaming ? streamingContent : message.content;
  const reasoningContent = isStreaming ? streamingReasoning : (message.reasoningContent || '');

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.5,
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 2,
      }}
    >
      {!isUser && (
        <Box sx={{ flexShrink: 0, mt: 0.5 }}>
          <SmartToyIcon fontSize="small" color="primary" />
        </Box>
      )}
      <Box
        sx={{
          maxWidth: '75%',
          px: 2,
          py: 1.5,
          borderRadius: 2,
          bgcolor: isUser ? 'primary.main' : 'background.paper',
          color: isUser ? 'primary.contrastText' : 'text.primary',
          border: isUser ? 'none' : 1,
          borderColor: 'divider',
          wordBreak: 'break-word',
          '& p': { mt: 0, mb: 0.5 },
        }}
      >
        {/* Thinking block for assistant messages */}
        {!isUser && reasoningContent && (
          <ThinkingBlock content={reasoningContent} streaming={isStreaming && !content} />
        )}

        {/* Message content */}
        {isUser ? (
          <Box sx={{ whiteSpace: 'pre-wrap' }}>{content}</Box>
        ) : content ? (
          <MarkdownRenderer content={content} />
        ) : isStreaming ? null : (
          '...'
        )}

        {/* Streaming cursor */}
        {isStreaming && content && (
          <Box component="span" sx={{ display: 'inline-block', width: 8, height: 16, bgcolor: 'currentColor', opacity: 0.6, animation: 'blink 1s step-end infinite', verticalAlign: 'text-bottom', ml: 0.5 }} />
        )}
      </Box>
      {isUser && (
        <Box sx={{ flexShrink: 0, mt: 0.5 }}>
          <PersonIcon fontSize="small" color="action" />
        </Box>
      )}

      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
    </Box>
  );
}
