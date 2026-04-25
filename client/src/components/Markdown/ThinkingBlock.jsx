import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

export default function ThinkingBlock({ content, streaming }) {
  const [expanded, setExpanded] = useState(false);

  if (!content) return null;

  return (
    <Box sx={{ mb: 1 }}>
      <Box
        onClick={() => !streaming && setExpanded(!expanded)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          cursor: streaming ? 'default' : 'pointer',
          userSelect: 'none',
          color: 'text.secondary',
          '&:hover': { color: streaming ? 'text.secondary' : 'text.primary' },
        }}
      >
        <Typography variant="caption" fontWeight={500}>
          思维过程
        </Typography>
        {!streaming && (
          <IconButton size="small" sx={{ p: 0.25 }}>
            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        )}
        {streaming && (
          <Typography variant="caption" sx={{ animation: 'pulse 1.5s infinite' }}>
            ...
          </Typography>
        )}
      </Box>
      {(expanded || streaming) && (
        <Box
          sx={{
            mt: 0.5,
            p: 1.5,
            borderRadius: 1,
            bgcolor: 'action.hover',
            borderLeft: 3,
            borderColor: 'primary.main',
            fontSize: 13,
            color: 'text.secondary',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            maxHeight: 300,
            overflow: 'auto',
          }}
        >
          {content}
        </Box>
      )}
    </Box>
  );
}
