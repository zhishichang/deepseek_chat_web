import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ThemeToggle from '../Common/ThemeToggle';
import ConfirmDialog from '../Common/ConfirmDialog';
import SearchBar from './SearchBar';
import ConversationList from './ConversationList';
import ModelSelector from './ModelSelector';
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
}) {
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = search
    ? conversations.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()))
    : conversations;

  const handleDelete = () => {
    if (deleteTarget) {
      onDeleteConversation(deleteTarget);
      setDeleteTarget(null);
    }
  };

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
        <Typography variant="h6" fontWeight={600} noWrap>DeepSeek Chat</Typography>
        <ThemeToggle mode={themeMode} onToggle={onToggleTheme} />
      </Box>

      <Box sx={{ px: 1, mb: 1 }}>
        <ModelSelector models={models} value={currentModel} onChange={onModelChange} />
      </Box>

      <Box sx={{ px: 1 }}>
        <SearchBar value={search} onChange={setSearch} />
      </Box>

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={onNewConversation}
        sx={{ mx: 1, mb: 1 }}
        size="small"
      >
        新建对话
      </Button>

      <Box sx={{ flex: 1, overflow: 'auto', px: 1 }}>
        <ConversationList
          conversations={filtered}
          activeId={activeId}
          onSelect={onSelectConversation}
          onRename={onRenameConversation}
          onDelete={(id) => setDeleteTarget(id)}
        />
        {filtered.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
            {search ? '没有匹配的对话' : '点击上方按钮新建对话'}
          </Typography>
        )}
      </Box>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="删除对话"
        message="确定要删除这个对话吗？此操作无法撤销。"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
