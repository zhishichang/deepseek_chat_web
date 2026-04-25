import TextField from '@mui/material/TextField';

export default function SystemPromptField({ value, onChange }) {
  return (
    <TextField
      label="System Prompt"
      placeholder="输入系统提示词，设定 AI 的角色和行为..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      multiline
      minRows={3}
      maxRows={8}
      fullWidth
      size="small"
    />
  );
}
