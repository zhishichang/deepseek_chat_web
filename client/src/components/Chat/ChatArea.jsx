import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import useChat from '../../hooks/useChat';
import { useState } from 'react';

export default function ChatArea({ activeId }) {
  const {
    messages,
    streamingContent,
    streamingReasoning,
    isGenerating,
    error,
    sendMessage,
    stop,
    regenerate,
    editMessage,
  } = useChat(activeId);
  const [snackbar, setSnackbar] = useState('');

  const handleCopy = async (content) => {
    await navigator.clipboard.writeText(content);
    setSnackbar('已复制到剪贴板');
  };

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
        <Alert severity="error" sx={{ mx: 2, mt: 1 }}>
          {error}
        </Alert>
      )}

      <MessageList
        messages={messages}
        streamingContent={streamingContent}
        streamingReasoning={streamingReasoning}
        isGenerating={isGenerating}
        onCopy={handleCopy}
        onEdit={editMessage}
        onRegenerate={regenerate}
      />

      <MessageInput
        onSend={sendMessage}
        isGenerating={isGenerating}
        onStop={stop}
      />

      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={2000}
        onClose={() => setSnackbar('')}
        message={snackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
