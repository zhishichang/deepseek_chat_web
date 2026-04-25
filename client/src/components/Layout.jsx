import { useState } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar from './Sidebar/Sidebar';
import ChatArea from './Chat/ChatArea';

export default function Layout({
  onToggleTheme,
  themeMode,
  conversations,
  activeId,
  onNewConversation,
  onSelectConversation,
  onRenameConversation,
  onDeleteConversation,
  models,
  currentModel,
  onModelChange,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSelectConversation = (id) => {
    onSelectConversation(id);
    if (isMobile) setDrawerOpen(false);
  };

  const handleNewConversation = async () => {
    await onNewConversation();
    if (isMobile) setDrawerOpen(false);
  };

  const sidebarProps = {
    onToggleTheme,
    themeMode,
    conversations,
    activeId,
    onNewConversation: handleNewConversation,
    onSelectConversation: handleSelectConversation,
    onRenameConversation,
    onDeleteConversation,
    models,
    currentModel,
    onModelChange,
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {isMobile ? (
        <Sidebar {...sidebarProps} drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      ) : (
        <Sidebar {...sidebarProps} />
      )}

      <ChatArea
        activeId={activeId}
        models={models}
        themeMode={themeMode}
        onThemeChange={(mode) => onToggleTheme(mode)}
        onMenuClick={isMobile ? () => setDrawerOpen(true) : undefined}
      />
    </Box>
  );
}
