import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';

export default function MessageBubble({ message, isStreaming, streamingContent }) {
  const isUser = message.role === 'user';
  const content = isStreaming ? streamingContent : message.content;

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
          whiteSpace: 'pre-wrap',
        }}
      >
        {content || '...'}
        {isStreaming && (
          <Box component="span" sx={{ animation: 'blink 1s infinite', ml: 0.5 }}>▌</Box>
        )}
      </Box>
      {isUser && (
        <Box sx={{ flexShrink: 0, mt: 0.5 }}>
          <PersonIcon fontSize="small" color="action" />
        </Box>
      )}
    </Box>
  );
}
