import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

export default function ThemeToggle({ mode, onToggle }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <IconButton onClick={() => onToggle()} size="small" title={isDark ? '切换亮色' : '切换暗色'}>
      {isDark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
    </IconButton>
  );
}
