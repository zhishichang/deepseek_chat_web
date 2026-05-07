import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import AndroidIcon from '@mui/icons-material/Android';
import PersonIcon from '@mui/icons-material/Person';
import MarkdownRenderer from '../Markdown/MarkdownRenderer';
import ThinkingBlock from '../Markdown/ThinkingBlock';
import MessageActions from './MessageActions';

export default function MessageBubble({
  message,
  isStreaming,
  streamingContent,
  streamingReasoning,
  isLastAssistant,
  onCopy,
  onEdit,
  onRegenerate,
}) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  const isUser = message.role === 'user';
  const content = isStreaming ? streamingContent : message.content;
  const reasoningContent = isStreaming ? streamingReasoning : (message.reasoningContent || '');

  const startEdit = () => {
    setEditContent(message.content);
    setEditing(true);
  };

  const submitEdit = () => {
    if (editContent.trim() && editContent.trim() !== message.content) {
      onEdit?.(message.id, editContent.trim());
    }
    setEditing(false);
  };

  return (
    <Box
      className="MessageBubble-root"
      sx={{
        display: 'flex',
        gap: 1.5,
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 2,
        px: 1,
      }}
    >
      {!isUser && (
        <Box sx={{ flexShrink: 0, mt: 0.5 }}>
          <AndroidIcon fontSize="small" color="primary" />
        </Box>
      )}
      <Box sx={{ maxWidth: '100%', minWidth: 0, flex: !isUser ? 1 : 'none', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderRadius: 2,
            bgcolor: isUser ? 'primary.main' : 'background.paper',
            color: isUser ? 'primary.contrastText' : 'text.primary',
            border: isUser ? 'none' : 1,
            borderColor: 'divider',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
            '& p': { mt: 0, mb: 0.5 },
          }}
        >
          {editing ? (
            <>
              <TextField
                multiline
                fullWidth
                minRows={1}
                maxRows={6}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                size="small"
                sx={{ mb: 1 }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitEdit(); }
                  if (e.key === 'Escape') setEditing(false);
                }}
              />
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button size="small" onClick={() => setEditing(false)}>取消</Button>
                <Button size="small" variant="contained" onClick={submitEdit}>保存并重新提交</Button>
              </Box>
            </>
          ) : (
            <>
              {!isUser && reasoningContent && (
                <ThinkingBlock content={reasoningContent} streaming={isStreaming && !content} />
              )}
              {isUser ? (
                <Box sx={{ whiteSpace: 'pre-wrap' }}>{content}</Box>
              ) : content ? (
                <MarkdownRenderer content={content} />
              ) : isStreaming ? null : (
                '...'
              )}
              {isStreaming && content && (
                <Box component="span" sx={{ display: 'inline-block', width: 8, height: 16, bgcolor: 'currentColor', opacity: 0.6, animation: 'blink 1s step-end infinite', verticalAlign: 'text-bottom', ml: 0.5 }} />
              )}
            </>
          )}
        </Box>

        {/* Action buttons inside the bubble flow, visible on hover */}
        {!editing && !isStreaming && (
          <MessageActions
            message={message}
            onCopy={onCopy}
            onEdit={isUser ? startEdit : undefined}
            onRegenerate={onRegenerate}
            isLastAssistant={isLastAssistant}
          />
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
