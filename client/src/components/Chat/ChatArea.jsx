import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import useChat from '../../hooks/useChat';

export default function ChatArea({ activeId }) {
  const { messages, streamingContent, streamingReasoning, isGenerating, error, sendMessage, stop } = useChat(activeId);

  if (!activeId) {
    return (
      <Box
        sx={{
          flex: 1,
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <Typography variant="h5" color="text.secondary">
          选择或创建一个对话开始聊天
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      {error && (
        <Alert severity="error" onClose={() => {}} sx={{ mx: 2, mt: 1 }}>
          {error}
        </Alert>
      )}

      <MessageList
        messages={messages}
        streamingContent={streamingContent}
        streamingReasoning={streamingReasoning}
        isGenerating={isGenerating}
      />

      <MessageInput
        onSend={sendMessage}
        isGenerating={isGenerating}
        onStop={stop}
      />
    </Box>
  );
}
