import { useState } from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export default function ConversationItem({ conversation, active, onSelect, onRename, onDelete }) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title);

  const handleRenameSubmit = () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== conversation.title) {
      onRename(conversation.id, trimmed);
    }
    setEditing(false);
  };

  const modelLabel = conversation.model?.replace('deepseek-', '') || 'chat';

  return (
    <ListItemButton
      selected={active}
      onClick={() => !editing && onSelect(conversation.id)}
      sx={{ borderRadius: 1, mb: 0.5 }}
    >
      {editing ? (
        <TextField
          size="small"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleRenameSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRenameSubmit();
            if (e.key === 'Escape') setEditing(false);
          }}
          autoFocus
          fullWidth
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <>
          <ListItemText
            primary={conversation.title}
            primaryTypographyProps={{ noWrap: true, fontSize: 14 }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 1, gap: 0.5 }}>
            <Chip label={modelLabel} size="small" variant="outlined" sx={{ fontSize: 10, height: 20 }} />
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setMenuAnchor(e.currentTarget);
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>
        </>
      )}

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => { setEditing(true); setMenuAnchor(null); }}>
          重命名
        </MenuItem>
        <MenuItem onClick={() => { onDelete(conversation.id); setMenuAnchor(null); }} sx={{ color: 'error.main' }}>
          删除
        </MenuItem>
      </Menu>
    </ListItemButton>
  );
}
