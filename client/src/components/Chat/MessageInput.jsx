import { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import StopIcon from '@mui/icons-material/Stop';

export default function MessageInput({ onSend, isGenerating, onStop, disabled }) {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);
  const composingRef = useRef(false);

  const handleSend = () => {
    if (!input.trim() || isGenerating || disabled) return;
    onSend(input);
    setInput('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !composingRef.current) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper', flexShrink: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <TextField
            inputRef={inputRef}
            multiline
            minRows={1}
            maxRows={4}
            fullWidth
            placeholder={disabled ? '网络不可用...' : '输入消息...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => { composingRef.current = true; }}
            onCompositionEnd={() => { composingRef.current = false; }}
            disabled={isGenerating || disabled}
            size="small"
          />
        </Box>
        {isGenerating ? (
          <IconButton color="error" onClick={onStop} title="停止生成" sx={{ flexShrink: 0 }}>
            <StopIcon />
          </IconButton>
        ) : (
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={!input.trim() || disabled}
            title="发送"
            sx={{ flexShrink: 0 }}
          >
            <SendIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}
