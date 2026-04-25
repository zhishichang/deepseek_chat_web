import { useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckIcon from '@mui/icons-material/Check';

export default function MessageActions({ message, onCopy, onEdit, onRegenerate, isLastAssistant }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    await onCopy?.(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 0,
        opacity: 0,
        transition: 'opacity 0.2s',
        '.MessageBubble-root:hover &': { opacity: 0.7 },
        '&:hover': { opacity: '1 !important' },
        ml: -0.5,
        mt: 0,
      }}
    >
      <Tooltip title="复制" arrow>
        <IconButton size="small" onClick={handleCopy} sx={{ p: 0.25 }}>
          {copied ? <CheckIcon sx={{ fontSize: 14 }} /> : <ContentCopyIcon sx={{ fontSize: 14 }} />}
        </IconButton>
      </Tooltip>

      {isUser && onEdit && (
        <Tooltip title="编辑" arrow>
          <IconButton size="small" onClick={() => onEdit(message)} sx={{ p: 0.25 }}>
            <EditIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      )}

      {!isUser && isLastAssistant && onRegenerate && (
        <Tooltip title="重新生成" arrow>
          <IconButton size="small" onClick={onRegenerate} sx={{ p: 0.25 }}>
            <RefreshIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
