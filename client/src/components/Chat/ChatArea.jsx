import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TokenUsageBar from './TokenUsageBar';
import SettingsDialog from '../Settings/SettingsDialog';
import useChat from '../../hooks/useChat';
import useSettings from '../../hooks/useSettings';
import useTokenCount from '../../hooks/useTokenCount';
import db from '../../db';
import { exportAsMarkdown, exportAsJSON, downloadFile } from '../../utils/export';
import IosShareIcon from '@mui/icons-material/IosShare';
import ReplayIcon from '@mui/icons-material/Replay';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import MenuIcon from '@mui/icons-material/Menu';

export default function ChatArea({ activeId, models, themeMode, onThemeChange, onMenuClick }) {
  const {
    messages,
    streamingContent,
    streamingReasoning,
    isGenerating,
    error,
    retryAfter,
    online,
    sendMessage,
    stop,
    regenerate,
    retryLast,
    editMessage,
    lastUsage,
  } = useChat(activeId);
  const { settings, set: updateSetting, reset: resetSettings } = useSettings();
  const tokenCount = useTokenCount(messages, lastUsage);
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
          minHeight: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          position: 'relative',
        }}
      >
        <Box sx={{ position: 'absolute', top: 0, left: 0, px: 1, py: 0.5 }}>
          {onMenuClick && (
            <IconButton size="small" onClick={onMenuClick}>
              <MenuIcon />
            </IconButton>
          )}
        </Box>
        <Box sx={{ position: 'absolute', top: 0, right: 0, px: 2, py: 0.5 }}>
          <SettingsDialog
            settings={settings}
            models={models}
            onUpdate={updateSetting}
            onReset={resetSettings}
            themeMode={themeMode}
            onThemeChange={onThemeChange}
          />
        </Box>
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
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', px: 2, py: 0.5, gap: 0.5, flexShrink: 0 }}>
        {onMenuClick && (
          <IconButton size="small" onClick={onMenuClick}>
            <MenuIcon />
          </IconButton>
        )}
        {!online && (
          <Chip
            icon={<WifiOffIcon />}
            label="离线"
            color="warning"
            size="small"
            variant="outlined"
          />
        )}
        <Box sx={{ flex: 1 }} />
        <SettingsDialog
          settings={settings}
          models={models}
          onUpdate={updateSetting}
          onReset={resetSettings}
          themeMode={themeMode}
          onThemeChange={onThemeChange}
        />
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

      <TokenUsageBar tokenCount={tokenCount} />

      {error && (
        <Alert
          severity="error"
          sx={{ mx: 2, alignItems: 'center', flexShrink: 0 }}
          action={
            retryLast ? (
              <Button
                color="error"
                size="small"
                startIcon={<ReplayIcon />}
                onClick={retryLast}
                disabled={isGenerating || !online}
              >
                重试
              </Button>
            ) : undefined
          }
        >
          {error}
          {retryAfter && `（${retryAfter}秒后可重试）`}
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
        disabled={!online}
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
