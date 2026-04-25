import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

export default function ModelSelector({ models, value, onChange }) {
  return (
    <FormControl size="small" fullWidth>
      <Select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        displayEmpty
        sx={{ fontSize: 13 }}
      >
        {models.length === 0 && (
          <MenuItem value="" disabled>
            <Typography fontSize={13} color="text.secondary">加载模型中...</Typography>
          </MenuItem>
        )}
        {models.map((m) => (
          <MenuItem key={m.id} value={m.id} sx={{ fontSize: 13 }}>
            {m.id}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
