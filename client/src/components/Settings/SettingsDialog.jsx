import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import SettingsIcon from '@mui/icons-material/Settings';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import Brightness3Icon from '@mui/icons-material/Brightness3';
import SettingsSystemDaydreamIcon from '@mui/icons-material/SettingsSystemDaydream';
import SystemPromptField from './SystemPromptField';
import ParameterControls from './ParameterControls';

export default function SettingsDialog({ settings, models, onUpdate, onReset, themeMode, onThemeChange }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip title="设置">
        <IconButton size="small" onClick={() => setOpen(true)}>
          <SettingsIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>设置</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>主题</Typography>
            <ToggleButtonGroup
              value={themeMode}
              exclusive
              onChange={(_, v) => v && onThemeChange(v)}
              size="small"
            >
              <ToggleButton value="light">
                <WbSunnyIcon fontSize="small" sx={{ mr: 0.5 }} /> 亮色
              </ToggleButton>
              <ToggleButton value="dark">
                <Brightness3Icon fontSize="small" sx={{ mr: 0.5 }} /> 暗色
              </ToggleButton>
              <ToggleButton value="system">
                <SettingsSystemDaydreamIcon fontSize="small" sx={{ mr: 0.5 }} /> 跟随系统
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Divider />

          <SystemPromptField
            value={settings.systemPrompt || ''}
            onChange={(v) => onUpdate('systemPrompt', v)}
          />

          <Divider />

          <ParameterControls
            settings={settings}
            models={models}
            onUpdate={onUpdate}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onReset} color="warning">重置默认</Button>
          <Button onClick={() => setOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
