import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import SmartToyIcon from '@mui/icons-material/SmartToy';

export default function StreamingIndicator({ reasoning }) {
  return (
    <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
      <Box sx={{ flexShrink: 0, mt: 0.5 }}>
        <SmartToyIcon fontSize="small" color="primary" />
      </Box>
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderRadius: 2,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <CircularProgress size={16} />
        <Typography variant="body2" color="text.secondary">
          {reasoning ? '正在思考...' : '正在回复...'}
        </Typography>
      </Box>
    </Box>
  );
}
