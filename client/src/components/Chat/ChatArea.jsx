import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import useChat from '../../hooks/useChat';
import db from '../../db';
import { exportAsMarkdown, exportAsJSON, downloadFile } from '../../utils/export';
import IosShareIcon from '@mui/icons-material/IosShare';

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
  const [exportAnchor, setExportAnchor] = useState(null);

  const handleCopy = async (content) => {
    await navigator.clipboard.writeText(content);
    setSnackbar('已复制到剪贴板');
  };

  const handleExportMarkdown = async () => {
    const md = await exportAsMarkdown(activeId);
    const conv = await db.conversations.get(activeId);
    downloadFile(md, `${conv?.title || '对话'}.md`, 'text/markdown');
    setExportAnchor(null);
  };

  const handleExportJSON = async () => {
    const json = await exportAsJSON(activeId);
    downloadFile(json, 'conversation.json', 'application/json');
    setExportAnchor(null);
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
      {/* Top bar with export */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2, py: 0.5 }}>
        <Tooltip title="导出对话">
          <IconButton size="small" onClick={(e) => setExportAnchor(e.currentTarget)}>
            <IosShareIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={exportAnchor}
          open={Boolean(exportAnchor)}
          onClose={() => setExportAnchor(null)}
        >
          <MenuItem onClick={handleExportMarkdown}>导出为 Markdown</MenuItem>
          <MenuItem onClick={handleExportJSON}>导出为 JSON</MenuItem>
        </Menu>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mx: 2 }}>
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
