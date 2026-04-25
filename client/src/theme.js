import { createTheme } from '@mui/material/styles';

const common = {
  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  shape: { borderRadius: 8 },
};

export const lightTheme = createTheme({
  ...common,
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    sidebar: {
      bg: '#f0f0f0',
      hover: '#e0e0e0',
      active: '#d0d0d0',
    },
  },
});

export const darkTheme = createTheme({
  ...common,
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    background: {
      default: '#1a1a2e',
      paper: '#16213e',
    },
    sidebar: {
      bg: '#0f0f23',
      hover: '#1a1a3e',
      active: '#252550',
    },
  },
});
