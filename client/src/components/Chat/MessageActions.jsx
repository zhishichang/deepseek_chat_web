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
    <Box sx={{ display: 'flex', gap: 0.5, opacity: 0, transition: 'opacity 0.2s', '.MessageBubble-root:hover &': { opacity: 1 } }}>
      <Tooltip title="复制" arrow>
        <IconButton size="small" onClick={handleCopy}>
          {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
        </IconButton>
      </Tooltip>

      {isUser && onEdit && (
        <Tooltip title="编辑" arrow>
          <IconButton size="small" onClick={() => onEdit(message)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {!isUser && isLastAssistant && onRegenerate && (
        <Tooltip title="重新生成" arrow>
          <IconButton size="small" onClick={onRegenerate}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
