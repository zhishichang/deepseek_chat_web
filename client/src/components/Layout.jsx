import Box from '@mui/material/Box';
import Sidebar from './Sidebar/Sidebar';
import ChatArea from './Chat/ChatArea';

export default function Layout({ onToggleTheme, themeMode }) {
  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar onToggleTheme={onToggleTheme} themeMode={themeMode} />
      <ChatArea />
    </Box>
  );
}
