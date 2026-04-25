import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import ModelSelector from './ModelSelector';
import SearchBar from './SearchBar';
import ConversationList from './ConversationList';
import ThemeToggle from '../Common/ThemeToggle';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';

export default function Sidebar({
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
  drawer,
  open,
  onClose,
}) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter((c) => c.title?.toLowerCase().includes(q));
  }, [conversations, search]);

  const content = (
    <Box
      sx={{
        width: 280,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRight: drawer ? 0 : 1,
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <ModelSelector models={models} value={currentModel} onChange={onModelChange} />
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={onNewConversation}
          fullWidth
        >
          新建对话
        </Button>
        <SearchBar value={search} onChange={setSearch} />
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', px: 1 }}>
        <ConversationList
          conversations={filtered}
          activeId={activeId}
          onSelect={onSelectConversation}
          onRename={onRenameConversation}
          onDelete={onDeleteConversation}
        />
      </Box>

      <Box sx={{ p: 1.5, borderTop: 1, borderColor: 'divider' }}>
        <ThemeToggle mode={themeMode} onToggle={onToggleTheme} />
      </Box>
    </Box>
  );

  if (drawer) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
        }}
      >
        {content}
      </Drawer>
    );
  }

  return content;
}
