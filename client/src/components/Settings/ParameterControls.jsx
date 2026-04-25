import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

export default function ParameterControls({
  settings,
  models,
  onUpdate,
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <FormControl size="small" fullWidth>
        <InputLabel>默认模型</InputLabel>
        <Select
          value={settings.defaultModel || ''}
          label="默认模型"
          onChange={(e) => onUpdate('defaultModel', e.target.value)}
        >
          {models.length === 0 && (
            <MenuItem value="" disabled>加载中...</MenuItem>
          )}
          {models.map((m) => (
            <MenuItem key={m.id} value={m.id}>{m.id}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box>
        <Typography variant="body2" gutterBottom>
          Temperature: {settings.temperature}
        </Typography>
        <Slider
          value={settings.temperature}
          onChange={(_, v) => onUpdate('temperature', v)}
          min={0}
          max={2}
          step={0.1}
          marks={[{ value: 0, label: '0' }, { value: 1, label: '1' }, { value: 2, label: '2' }]}
          valueLabelDisplay="auto"
          size="small"
        />
      </Box>

      <Box>
        <Typography variant="body2" gutterBottom>
          Max Tokens
        </Typography>
        <TextField
          type="number"
          size="small"
          value={settings.maxTokens}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v) && v >= 1 && v <= 8192) onUpdate('maxTokens', v);
          }}
          inputProps={{ min: 1, max: 8192 }}
          fullWidth
        />
      </Box>

      <Box>
        <Typography variant="body2" gutterBottom>
          Max Context Tokens
        </Typography>
        <TextField
          type="number"
          size="small"
          value={settings.maxContextTokens}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v) && v >= 1024 && v <= 131072) onUpdate('maxContextTokens', v);
          }}
          inputProps={{ min: 1024, max: 131072 }}
          fullWidth
        />
      </Box>

      <FormControlLabel
        control={
          <Switch
            checked={settings.streamMode}
            onChange={(e) => onUpdate('streamMode', e.target.checked)}
          />
        }
        label="流式输出"
      />
    </Box>
  );
}
