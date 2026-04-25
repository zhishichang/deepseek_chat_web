import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ThemeToggle from '../Common/ThemeToggle';

export default function Sidebar({ onToggleTheme, themeMode }) {
  return (
    <Box
      sx={{
        width: 280,
        minWidth: 280,
        height: '100vh',
        bgcolor: 'sidebar.bg',
        borderRight: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" fontWeight={600}>DeepSeek Chat</Typography>
        <ThemeToggle mode={themeMode} onToggle={onToggleTheme} />
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
          对话列表将在此显示
        </Typography>
      </Box>
    </Box>
  );
}
