import List from '@mui/material/List';
import ConversationItem from './ConversationItem';

export default function ConversationList({ conversations, activeId, onSelect, onRename, onDelete }) {
  if (conversations.length === 0) {
    return null;
  }

  return (
    <List dense sx={{ width: '100%' }}>
      {conversations.map((c) => (
        <ConversationItem
          key={c.id}
          conversation={c}
          active={c.id === activeId}
          onSelect={onSelect}
          onRename={onRename}
          onDelete={onDelete}
        />
      ))}
    </List>
  );
}
