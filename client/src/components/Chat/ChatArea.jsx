import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function ChatArea() {
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
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h5" color="text.secondary">
          选择或创建一个对话开始聊天
        </Typography>
      </Box>
    </Box>
  );
}
