import Box from '@mui/material/Box';
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
  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        onToggleTheme={onToggleTheme}
        themeMode={themeMode}
        conversations={conversations}
        activeId={activeId}
        onNewConversation={onNewConversation}
        onSelectConversation={onSelectConversation}
        onRenameConversation={onRenameConversation}
        onDeleteConversation={onDeleteConversation}
        models={models}
        currentModel={currentModel}
        onModelChange={onModelChange}
      />
      <ChatArea activeId={activeId} />
    </Box>
  );
}
