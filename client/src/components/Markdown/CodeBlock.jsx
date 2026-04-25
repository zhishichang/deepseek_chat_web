import { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

export default function CodeBlock({ className, children }) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef(null);

  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const code = String(children).replace(/\n$/, '');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box sx={{ position: 'relative', my: 1 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: '#1e1e1e',
          px: 1.5,
          py: 0.5,
          borderRadius: '8px 8px 0 0',
        }}
      >
        <Typography variant="caption" sx={{ color: '#999' }}>
          {language || 'code'}
        </Typography>
        <IconButton size="small" onClick={handleCopy} sx={{ color: '#999' }}>
          {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
        </IconButton>
      </Box>
      <Box
        component="pre"
        sx={{
          bgcolor: '#1e1e1e',
          color: '#d4d4d4',
          p: 1.5,
          m: 0,
          borderRadius: '0 0 8px 8px',
          overflow: 'auto',
          fontSize: 13,
          lineHeight: 1.5,
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}
      >
        <code ref={codeRef} className={className}>
          {code}
        </code>
      </Box>
    </Box>
  );
}
